INSERT INTO users (user_id, first_name, last_name, email, role)
VALUES
  (1, 'Test', 'Instructor', 'instructor@tap.local', 'instructor'),
  (2, 'John', 'Student', 'student@tap.local', 'student')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO courses (
  course_id,
  course_code,
  course_name,
  department,
  instructor_id
)
VALUES (
  1,
  'CS-101',
  'Introduction to Computer Science',
  'Computer Science',
  1
)
ON CONFLICT (course_id) DO NOTHING;

INSERT INTO enrollments (student_id, course_id)
VALUES (2, 1)
ON CONFLICT (student_id, course_id)
DO UPDATE SET status = 'active';

INSERT INTO class_sessions (
  session_id,
  course_id,
  session_name,
  start_time,
  created_by,
  status
)
VALUES (
  1,
  1,
  'Development Test Session',
  NOW(),
  1,
  'active'
)
ON CONFLICT (session_id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('users', 'user_id'),
  GREATEST((SELECT MAX(user_id) FROM users), 1)
);

SELECT setval(
  pg_get_serial_sequence('courses', 'course_id'),
  GREATEST((SELECT MAX(course_id) FROM courses), 1)
);

SELECT setval(
  pg_get_serial_sequence('class_sessions', 'session_id'),
  GREATEST((SELECT MAX(session_id) FROM class_sessions), 1)
);
