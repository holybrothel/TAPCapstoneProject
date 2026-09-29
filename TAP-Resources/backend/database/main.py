import os
import cv2
import face_recognition
import pandas as pd
from datetime import datetime

# --- CONFIGURATION & DIRECTORIES ---
KNOWN_DIR = "known_students"
ATTENDANCE_FILE = "attendance.csv"

# --- STEP 1: INITIALIZE ATTENDANCE LOG ---
# Create the spreadsheet file with headers if it doesn't already exist
if not os.path.exists(ATTENDANCE_FILE):
    df = pd.DataFrame(columns=["Name", "Date", "Timestamp", "Status"])
    df.to_csv(ATTENDANCE_FILE, index=False)

# Keep track of students who checked in *during this current session* to prevent duplicates
checked_in_today = set()

# Load already checked-in students from the file if restarting the script
try:
    existing_df = pd.read_csv(ATTENDANCE_FILE)
    current_date = datetime.now().strftime("%Y-%m-%d")
    today_records = existing_df[existing_df["Date"] == current_date]
    checked_in_today = set(today_records["Name"].tolist())
except Exception:
    pass

# --- STEP 2: LOAD KNOWN STUDENT IMAGES & ENCODE THEM ---
print("[INFO] Loading known student profiles...")
known_encodings = []
known_names = []

if not os.path.exists(KNOWN_DIR) or not os.listdir(KNOWN_DIR):
    print(f"[ERROR] The directory '{KNOWN_DIR}' is missing or empty. Please add student images.")
    exit()

for filename in os.listdir(KNOWN_DIR):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        path = os.path.join(KNOWN_DIR, filename)
        
        # Load image file and extract its 128-dimensional face embedding vector
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)
        
        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            # Derive name from filename (e.g., "John_Doe.jpg" -> "John Doe")
            name = os.path.splitext(filename)[0].replace("_", " ")
            known_names.append(name)
            print(f" Loaded: {name}")
        else:
            print(f" [WARNING] Could not find a clear face in {filename}. Skipped.")

print(f"[INFO] Successfully loaded {len(known_names)} student profile(s).")

# --- STEP 3: LIVE CAMERA ENGINE ---
video_capture = cv2.VideoCapture(0) # 0 is usually the built-in laptop webcam

process_this_frame = True

print("[INFO] Starting video stream. Press 'q' inside the video window to exit.")

while True:
    # Grab a single frame from the camera stream
    ret, frame = video_capture.read()
    if not ret:
        print("[ERROR] Failed to grab frame from camera.")
        break

    # Performance optimization: Only process every other frame to keep stream smooth
    if process_this_frame:
        # Resize frame to 1/4 size for drastically faster facial comparison speeds
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        
        # Convert the image from BGR color (OpenCV standard) to RGB color (face_recognition standard)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        face_names = []
        for face_encoding in face_encodings:
            # Check if the face is a match for any known student
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            name = "Unknown Visitor"

            # Use the known face with the smallest distance to the new face (highest similarity)
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = face_distances.argmin()
                if matches[best_match_index]:
                    name = known_names[best_match_index]
                    
                    # LOGGING LOGIC: If student hasn't checked in yet, commit to CSV
                    if name not in checked_in_today:
                        now = datetime.now()
                        new_record = {
                            "Name": name,
                            "Date": now.strftime("%Y-%m-%d"),
                            "Timestamp": now.strftime("%H:%M:%S"),
                            "Status": "Present"
                        }
                        
                        # Append directly to the CSV file
                        pd.DataFrame([new_record]).to_csv(ATTENDANCE_FILE, mode='a', header=False, index=False)
                        checked_in_today.add(name)
                        print(f"[ATTENDANCE] SUCCESS: Checked in {name} at {new_record['Timestamp']}")

            face_names.append(name)

    # Toggle frame skipping flag
    process_this_frame = not process_this_frame

    # --- STEP 4: DRAW ONSCREEN VISUALS ---
    for (top, right, bottom, left), name in zip(face_locations, face_names):
        # Scale back up face locations since the frame we processed was scaled to 1/4 size
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # Draw a bounding box around the detected face
        box_color = (0, 255, 0) if name != "Unknown Visitor" else (0, 0, 255) # Green for student, Red for unknown
        cv2.rectangle(frame, (left, top), (right, bottom), box_color, 2)

        # Draw a filled label banner underneath the box
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), box_color, cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)

    # Display the final, interactive video feed window
    cv2.imshow('Classroom Live Attendance System', frame)

    # Hit 'q' on the keyboard to exit the program loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Clean up resources elegantly when shutting down
video_capture.release()
cv2.destroyAllWindows()
print("[INFO] System closed safely.")
