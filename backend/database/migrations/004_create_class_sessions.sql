CREATE TABLE IF NOT EXISTS class_sessions (
  session_id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  session_name VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(100),
  created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'active', 'closed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
