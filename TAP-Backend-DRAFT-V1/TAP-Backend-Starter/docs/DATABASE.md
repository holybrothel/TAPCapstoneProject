# T.A.P. Database Design

## Core tables

### users

Stores both student and instructor accounts.

Important fields:

- `user_id` — primary key
- `email` — unique
- `student_number` — unique when present
- `role` — `student` or `instructor`

### courses

Stores class/course information.

- Each course may reference one instructor.
- A course may have many enrollments.
- A course may have many class sessions.

### enrollments

Join table connecting students to courses.

Important rule:

`UNIQUE(student_id, course_id)`

### class_sessions

Represents one meeting of a course.

Statuses:

- `scheduled`
- `active`
- `closed`

Only active sessions should accept normal check-ins.

### face_profiles

Connects a T.A.P. student to the subject identifier used by the face-recognition service.

For the MVP, T.A.P. does not need to store raw face images in PostgreSQL.

### attendance_records

Stores one attendance result per student per session.

Important database constraint:

`UNIQUE(student_id, session_id)`

This provides database-level duplicate check-in protection.

## Main relationships

- One student → many enrollments
- One course → many enrollments
- One course → many class sessions
- One student → one face profile
- One student → many attendance records
- One class session → many attendance records
