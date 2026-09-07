# T.A.P. API Contract

Base URL during local development:

`http://localhost:3000/api`

## Health

### GET /health

Response:

```json
{
  "success": true,
  "message": "T.A.P. backend is running"
}
```

---

## Courses

### GET /courses

Returns active courses.

### GET /courses/:courseId

Returns one course.

### GET /courses/:courseId/students

Returns enrolled students.

### POST /courses/:courseId/enrollments

Request:

```json
{
  "studentId": 2
}
```

---

## Sessions

### GET /courses/:courseId/sessions

Returns course sessions.

### POST /courses/:courseId/sessions

Request:

```json
{
  "sessionName": "September 7 Lecture",
  "startTime": "2026-09-07T10:00:00",
  "endTime": "2026-09-07T11:15:00",
  "location": "Room 101",
  "createdBy": 1,
  "status": "active"
}
```

### GET /sessions/:sessionId

Returns one session.

---

## Attendance

### POST /sessions/:sessionId/check-in

Content-Type:

`multipart/form-data`

Field:

`faceImage`

In mock mode, the uploaded image is accepted but recognition returns the student configured by `MOCK_STUDENT_ID`.

Successful response:

```json
{
  "success": true,
  "student": {
    "id": 2,
    "name": "John Student",
    "studentNumber": null
  },
  "sessionId": 1,
  "checkInTime": "2026-09-07T10:15:22.000Z",
  "verificationStatus": "verified",
  "confidence": 0.99
}
```

Possible errors:

- `FACE_IMAGE_REQUIRED`
- `SESSION_NOT_FOUND`
- `SESSION_NOT_ACTIVE`
- `FACE_NOT_RECOGNIZED`
- `STUDENT_NOT_ENROLLED`
- `ALREADY_CHECKED_IN`

### GET /sessions/:sessionId/attendance

Returns the attendance list for a session.

---

## Face Enrollment

### POST /students/:studentId/face/enroll

Content-Type:

`multipart/form-data`

Field:

`faceImage`

In mock mode this creates a local face profile such as:

`student-2`

Real CompreFace integration is intentionally isolated in:

`src/services/compreface.service.js`
