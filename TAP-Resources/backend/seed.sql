INSERT INTO users (first_name, last_name, email, student_number, 
password_hash, role)
VALUES 
('Tajah', 'Refuge', 't.refuge3209@student.tsu.edu', 'T00773209', 
'hashed_pass_123', 
'student'),
('Muhammad', 'Khan', 'Muhammad.Khan@tsu.edu', NULL, 
'hashed_pass_456', 
'instructor');

INSERT INTO courses (course_code, course_name, department)
VALUES ('CS499', 'Capstone Proj', 'Computer Science');


INSERT INTO enrollments (student_id, course_id)
VALUES 
(1, 1);

INSERT INTO class_sessions (course_id, session_name, start_time, end_time, 
location, created_by)
VALUES (
    1, 
    'Tuesday Class ', 
    CURRENT_TIMESTAMP - INTERVAL '30 minutes', 
    CURRENT_TIMESTAMP + INTERVAL '1 hour', 
    'Tech Building - Room 330', 
   2
);
