CREATE TABLE IF NOT EXISTS courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL UNIQUE,
  course_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  instructor_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
