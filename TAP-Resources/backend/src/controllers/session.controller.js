const { pool } = require("../config/db");
const faceService = require("../services/compreface.service");

async function getSession(req, res, next) {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      `SELECT * FROM class_sessions WHERE session_id = $1`,
      [sessionId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        error: "SESSION_NOT_FOUND",
        message: "Class session not found"
      });
    }

    res.json({ success: true, session: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function getAttendance(req, res, next) {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      `SELECT
         ar.attendance_id,
         ar.student_id,
         u.first_name,
         u.last_name,
         u.student_number,
         ar.check_in_time,
         ar.confidence_score,
         ar.verification_status
       FROM attendance_records ar
       JOIN users u ON u.user_id = ar.student_id
       WHERE ar.session_id = $1
       ORDER BY ar.check_in_time`,
      [sessionId]
    );

    res.json({
      success: true,
      attendance: result.rows
    });
  } catch (error) {
    next(error);
  }
}

async function checkIn(req, res, next) {
  const client = await pool.connect();

  try {
    const { sessionId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "FACE_IMAGE_REQUIRED",
        message: "faceImage is required"
      });
    }

    const sessionResult = await client.query(
      `SELECT * FROM class_sessions WHERE session_id = $1`,
      [sessionId]
    );

    if (!sessionResult.rowCount) {
      return res.status(404).json({
        success: false,
        error: "SESSION_NOT_FOUND",
        message: "Class session not found"
      });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "active") {
      return res.status(409).json({
        success: false,
        error: "SESSION_NOT_ACTIVE",
        message: "This class session is not active"
      });
    }

    const recognition = await faceService.recognizeFace(req.file);

    if (!recognition.matched) {
      return res.status(401).json({
        success: false,
        error: "FACE_NOT_RECOGNIZED",
        message: "Face could not be matched to an enrolled student"
      });
    }

    const studentId = recognition.studentId;

    const enrollmentResult = await client.query(
      `SELECT 1
       FROM enrollments
       WHERE student_id = $1
         AND course_id = $2
         AND status = 'active'`,
      [studentId, session.course_id]
    );

    if (!enrollmentResult.rowCount) {
      return res.status(403).json({
        success: false,
        error: "STUDENT_NOT_ENROLLED",
        message: "Recognized student is not enrolled in this course"
      });
    }

    await client.query("BEGIN");

    const duplicateResult = await client.query(
      `SELECT attendance_id
       FROM attendance_records
       WHERE student_id = $1 AND session_id = $2`,
      [studentId, sessionId]
    );

    if (duplicateResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        error: "ALREADY_CHECKED_IN",
        message: "Attendance has already been recorded for this session"
      });
    }

    const attendanceResult = await client.query(
      `INSERT INTO attendance_records
        (student_id, session_id, confidence_score, verification_status)
       VALUES ($1, $2, $3, 'verified')
       RETURNING *`,
      [studentId, sessionId, recognition.confidence]
    );

    await client.query("COMMIT");

    const studentResult = await client.query(
      `SELECT user_id, first_name, last_name, student_number
       FROM users
       WHERE user_id = $1`,
      [studentId]
    );

    const student = studentResult.rows[0];

    res.status(201).json({
      success: true,
      student: {
        id: student.user_id,
        name: `${student.first_name} ${student.last_name}`,
        studentNumber: student.student_number
      },
      sessionId: Number(sessionId),
      checkInTime: attendanceResult.rows[0].check_in_time,
      verificationStatus: "verified",
      confidence: recognition.confidence
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "ALREADY_CHECKED_IN",
        message: "Attendance has already been recorded for this session"
      });
    }

    next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  getSession,
  getAttendance,
  checkIn
};
