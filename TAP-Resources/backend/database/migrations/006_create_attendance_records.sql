CREATE TABLE IF NOT EXISTS attendance_records (
  attendance_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_id INT NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL DEFAULT NOW(),
  confidence_score DECIMAL(6,5),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'verified'
    CHECK (verification_status IN ('verified', 'manual', 'failed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session
  ON attendance_records(session_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student
  ON attendance_records(student_id);
