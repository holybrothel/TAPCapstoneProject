# Team Handoff

## Frontend

Build against the API contract in `docs/API.md`.

You can develop the UI before real face recognition is complete because the backend supports mock recognition using:

`USE_MOCK_FACE=true`

Student flow:

1. Select active class session.
2. Capture image from webcam/camera.
3. Submit as `faceImage` to:
   `POST /api/sessions/:sessionId/check-in`
4. Display success or error response.

Instructor flow:

1. Create session.
2. View enrolled students.
3. View attendance list.

## Face Recognition / CompreFace

All CompreFace-specific code belongs in:

`src/services/compreface.service.js`

The rest of the backend expects:

```js
recognizeFace(file)
```

to return:

```json
{
  "matched": true,
  "studentId": 2,
  "confidence": 0.99
}
```

and:

```js
enrollFace(studentId, file)
```

to return:

```json
{
  "subjectId": "student-2"
}
```

Do not make the attendance controller depend directly on CompreFace's raw response format.

## Testing

Primary MVP test cases:

1. Active session + recognized enrolled student → success.
2. Second check-in by same student/session → `ALREADY_CHECKED_IN`.
3. Recognized but unenrolled student → `STUDENT_NOT_ENROLLED`.
4. Closed/scheduled session → `SESSION_NOT_ACTIVE`.
5. Missing image → `FACE_IMAGE_REQUIRED`.
6. Unrecognized face → `FACE_NOT_RECOGNIZED`.
7. Instructor can retrieve the successful attendance record.
