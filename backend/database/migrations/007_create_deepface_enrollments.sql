-- Prototype reference images: restrict access, retention, and consent before production.
CREATE TABLE IF NOT EXISTS deepface_enrollments (
  student_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  photo BYTEA NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
