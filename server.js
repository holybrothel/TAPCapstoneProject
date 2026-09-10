const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Attendance Recording Endpoint (POST)
app.post('/api/attendance', async (req, res) => {
  const { student_id, session_id, confidence_score, verification_status } 
= req.body;

  try {
    const query = `
      INSERT INTO attendance_records (student_id, session_id, 
confidence_score, verification_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [student_id, session_id, confidence_score || 0.95, 
verification_status || 'verified'];

    const result = await pool.query(query, values);
    return res.status(201).json({
      message: 'Attendance recorded successfully!',
      record: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Duplicate Check-In',
        message: `Student has already recorded attendance for this class 
session.`,
      });
    }

    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Student Attendance History Endpoint (GET)
app.get('/api/attendance/student/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        ar.attendance_id,
        ar.check_in_time,
        ar.confidence_score,
        ar.verification_status,
        cs.session_name,
        cs.start_time,
        c.course_code,
        c.course_name
      FROM attendance_records ar
      JOIN class_sessions cs ON ar.session_id = cs.session_id
      JOIN courses c ON cs.course_id = c.course_id
      WHERE ar.student_id = $1
      ORDER BY ar.check_in_time DESC;
    `;
    const result = await pool.query(query, [id]);

    return res.status(200).json({
      student_id: Number(id),
      total_records: result.rowCount,
      attendance: result.rows,
    });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`T.A.P. Backend running on http://localhost:${PORT}`);
});
