"""Local classroom prototype only. Protect endpoints with real instructor authentication before deployment."""
import base64
import os
import cv2
import numpy as np
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from deepface import DeepFace
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=os.getenv('FRONTEND_ORIGIN', 'http://localhost:5500'))
pool = SimpleConnectionPool(1, 5, os.environ['DATABASE_URL'])


def decode_image(data_url):
    if not isinstance(data_url, str) or ',' not in data_url or len(data_url) > 8_000_000:
        raise ValueError('Invalid image')
    raw = base64.b64decode(data_url.split(',', 1)[1], validate=True)
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Invalid image')
    return img


def face_present(img):
    DeepFace.extract_faces(img_path=img, detector_backend='opencv', enforce_detection=True)


def valid_id(value):
    return type(value) is int and value > 0


@app.get('/health')
def health():
    return jsonify(status='ok', engine='DeepFace Facenet512')


@app.post('/enroll')
def enroll():
    data = request.get_json(silent=True) or {}
    student_id = data.get('student_id')
    if not valid_id(student_id):
        return jsonify(message='Enter a numeric student user ID.'), 400
    try:
        img = decode_image(data.get('image'))
        face_present(img)
        ok, encoded = cv2.imencode('.jpg', img)
        if not ok:
            raise ValueError('Unable to encode image')
    except (ValueError, TypeError):
        return jsonify(message='No clear face detected or invalid image.'), 400
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT 1 FROM users WHERE user_id=%s AND role=\'student\'', (student_id,))
            if not cur.fetchone():
                return jsonify(message='Student user ID not found.'), 404
            cur.execute('''INSERT INTO deepface_enrollments(student_id,photo) VALUES (%s,%s)
                           ON CONFLICT(student_id) DO UPDATE SET photo=EXCLUDED.photo,updated_at=NOW()''',
                        (student_id, psycopg2.Binary(encoded.tobytes())))
        conn.commit()
        return jsonify(message='Reference face enrolled for test student.', student_id=student_id)
    except psycopg2.Error:
        conn.rollback()
        app.logger.exception('Database error')
        return jsonify(message='Database error; check migration and connection.'), 500
    finally:
        pool.putconn(conn)


@app.post('/verify')
def verify():
    data = request.get_json(silent=True) or {}
    student_id, session_id = data.get('student_id'), data.get('session_id')
    if not valid_id(student_id) or not valid_id(session_id):
        return jsonify(match=False, message='Select a session and enter a numeric student user ID.'), 400
    try:
        live = decode_image(data.get('image'))
    except (ValueError, TypeError):
        return jsonify(match=False, message='Invalid camera image.'), 400
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute('''SELECT e.photo FROM deepface_enrollments e
                           JOIN users u ON u.user_id=e.student_id WHERE e.student_id=%s''', (student_id,))
            row = cur.fetchone()
            if not row:
                return jsonify(match=False, message='Student needs reference face enrollment.'), 404
            enrolled = cv2.imdecode(np.frombuffer(bytes(row[0]), np.uint8), cv2.IMREAD_COLOR)
            if enrolled is None:
                return jsonify(match=False, message='Stored reference image invalid.'), 400
            try:
                result = DeepFace.verify(img1_path=enrolled, img2_path=live,
                                         model_name='Facenet512', detector_backend='opencv', enforce_detection=True)
            except ValueError:
                return jsonify(match=False, message='No clear face detected.'), 400
            if not result['verified']:
                return jsonify(match=False, message='Face does not match reference.'), 401
            cur.execute('''SELECT 1 FROM class_sessions s JOIN enrollments e ON e.course_id=s.course_id
                           WHERE s.session_id=%s AND e.student_id=%s AND e.status='active' AND s.status='active' ''',
                        (session_id, student_id))
            if not cur.fetchone():
                return jsonify(match=False, message='Session inactive or student not enrolled in class.'), 403
            confidence = max(0.0, min(1.0, 1.0 - float(result['distance'])))
            cur.execute('''INSERT INTO attendance_records(student_id,session_id,confidence_score,verification_status)
                           VALUES (%s,%s,%s,'verified') ON CONFLICT(student_id,session_id) DO NOTHING
                           RETURNING attendance_id''', (student_id, session_id, confidence))
            created = cur.fetchone() is not None
        conn.commit()
        return jsonify(match=True, message='Face matched. Attendance recorded.' if created else 'Face matched. Already checked in.', newly_recorded=created)
    except psycopg2.Error:
        conn.rollback()
        app.logger.exception('Database error')
        return jsonify(match=False, message='Database error; verify schema and connection.'), 500
    finally:
        pool.putconn(conn)



@app.post('/identify')
def identify():
    # Identify one face among enrolled students in the selected active class session.
    data = request.get_json(silent=True) or {}
    session_id = data.get('session_id')
    if not valid_id(session_id):
        return jsonify(match=False, message='Select a valid session.'), 400
    try:
        live = decode_image(data.get('image'))
        faces = DeepFace.extract_faces(img_path=live, detector_backend='opencv', enforce_detection=True)
        if len(faces) != 1:
            return jsonify(match=False, message='Position exactly one face in the camera.'), 400
    except (ValueError, TypeError):
        return jsonify(match=False, message='No clear face detected.'), 400
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute('''SELECT u.user_id, u.first_name, u.last_name, d.photo
                           FROM class_sessions s
                           JOIN enrollments e ON e.course_id=s.course_id AND e.status='active'
                           JOIN users u ON u.user_id=e.student_id AND u.role='student'
                           JOIN deepface_enrollments d ON d.student_id=u.user_id
                           WHERE s.session_id=%s AND s.status='active' ''', (session_id,))
            candidates = cur.fetchall()
            if not candidates:
                return jsonify(match=False, message='Unable to find student. No registered faces in this active class.'), 404
            matches = []
            for student_id, first, last, raw in candidates:
                enrolled = cv2.imdecode(np.frombuffer(bytes(raw), np.uint8), cv2.IMREAD_COLOR)
                if enrolled is None:
                    continue
                try:
                    result = DeepFace.verify(img1_path=enrolled, img2_path=live,
                        model_name='Facenet512', detector_backend='opencv', enforce_detection=True)
                except (ValueError, TypeError):
                    continue
                if result.get('verified'):
                    matches.append((float(result['distance']), int(student_id), first, last))
            matches.sort(key=lambda row: row[0])
            # Reject ambiguous matches rather than silently selecting a student.
            if not matches or (len(matches) > 1 and matches[1][0] - matches[0][0] < 0.08):
                return jsonify(match=False, message='Unable to find student.'), 404
            distance, student_id, first, last = matches[0]
            confidence = max(0.0, min(1.0, 1.0 - distance))
            cur.execute('''INSERT INTO attendance_records(student_id,session_id,confidence_score,verification_status)
                           VALUES (%s,%s,%s,'verified') ON CONFLICT(student_id,session_id) DO NOTHING
                           RETURNING attendance_id''', (student_id, session_id, confidence))
            created = cur.fetchone() is not None
        conn.commit()
        return jsonify(match=True, student={'id':student_id,'name':f'{first} {last}'.strip()},
                       newly_recorded=created, message='Student attendance successfully taken' if created else 'Student already marked present')
    except psycopg2.Error:
        conn.rollback()
        app.logger.exception('Database error')
        return jsonify(match=False, message='Database error; check migration and connection.'), 500
    finally:
        pool.putconn(conn)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
