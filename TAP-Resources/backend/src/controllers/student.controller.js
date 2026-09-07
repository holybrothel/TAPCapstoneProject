const { pool } = require("../config/db");
const faceService = require("../services/compreface.service");

async function enrollFace(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "FACE_IMAGE_REQUIRED",
        message: "faceImage is required"
      });
    }

    const studentResult = await pool.query(
      `SELECT user_id, first_name, last_name
       FROM users
       WHERE user_id = $1 AND role = 'student'`,
      [studentId]
    );

    if (!studentResult.rowCount) {
      return res.status(404).json({
        success: false,
        error: "STUDENT_NOT_FOUND",
        message: "Student not found"
      });
    }

    const enrolled = await faceService.enrollFace(studentId, req.file);

    const result = await pool.query(
      `INSERT INTO face_profiles
        (student_id, compreface_subject_id, is_active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (student_id)
       DO UPDATE SET
         compreface_subject_id = EXCLUDED.compreface_subject_id,
         is_active = TRUE,
         updated_at = NOW()
       RETURNING *`,
      [studentId, enrolled.subjectId]
    );

    res.status(201).json({
      success: true,
      faceProfile: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { enrollFace };
