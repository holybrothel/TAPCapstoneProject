-- T.A.P. development-only sample data
-- Uses synthetic accounts. Do not use for real students.

BEGIN;

-- Create test instructor
INSERT INTO users (first_name, last_name, email, role)
VALUES ('Test', 'Instructor', 'instructor@tap.local', 'instructor')
ON CONFLICT (email) DO NOTHING;

-- Create test student
INSERT INTO users (first_name, last_name, email, role)
VALUES ('John', 'Student', 'student@tap.local', 'student')
ON CONFLICT (email) DO NOTHING;

-- Create test course
INSERT INTO courses (
    course_code,
    course_name,
    department,
    instructor_id
)
SELECT
    'CS-101',
    'Introduction to Computer Science',
    'Computer Science',
    user_id
FROM users
WHERE email = 'instructor@tap.local'
  AND role = 'instructor'
ON CONFLICT (course_code) DO NOTHING;

-- Enroll test student
INSERT INTO enrollments (student_id, course_id)
SELECT u.user_id, c.course_id
FROM users u
CROSS JOIN courses c
WHERE u.email = 'student@tap.local'
  AND u.role = 'student'
  AND c.course_code = 'CS-101'
ON CONFLICT (student_id, course_id)
DO UPDATE SET status = 'active';

-- Create test class session if it doesn't exist
INSERT INTO class_sessions (
    course_id,
    session_name,
    start_time,
    created_by,
    status
)
SELECT
    c.course_id,
    'Development Test Session',
    NOW(),
    u.user_id,
    'active'
FROM courses c
JOIN users u ON u.email = 'instructor@tap.local'
WHERE c.course_code = 'CS-101'
  AND u.role = 'instructor'
  AND NOT EXISTS (
      SELECT 1
      FROM class_sessions s
      WHERE s.course_id = c.course_id
        AND s.session_name = 'Development Test Session'
  );

COMMIT;
