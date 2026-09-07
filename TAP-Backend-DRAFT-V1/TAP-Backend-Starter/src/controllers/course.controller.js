const { pool } = require("../config/db");

async function listCourses(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT c.*, u.first_name AS instructor_first_name,
             u.last_name AS instructor_last_name
      FROM courses c
      LEFT JOIN users u ON u.user_id = c.instructor_id
      WHERE c.is_active = TRUE
      ORDER BY c.course_code
    `);

    res.json({ success: true, courses: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1`,
      [courseId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        error: "COURSE_NOT_FOUND",
        message: "Course not found"
      });
    }

    res.json({ success: true, course: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function listSessions(req, res, next) {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT * FROM class_sessions
       WHERE course_id = $1
       ORDER BY start_time DESC`,
      [courseId]
    );

    res.json({ success: true, sessions: result.rows });
  } catch (error) {
    next(error);
  }
}

async function createSession(req, res, next) {
  try {
    const { courseId } = req.params;
    const {
      sessionName,
      startTime,
      endTime = null,
      location = null,
      createdBy = null,
      status = "active"
    } = req.body;

    if (!sessionName || !startTime) {
      return res.status(400).json({
        success: false,
        error: "INVALID_REQUEST",
        message: "sessionName and startTime are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO class_sessions
        (course_id, session_name, start_time, end_time, location, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [courseId, sessionName, startTime, endTime, location, createdBy, status]
    );

    res.status(201).json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function listStudents(req, res, next) {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT
         u.user_id AS student_id,
         u.first_name,
         u.last_name,
         u.email,
         u.student_number,
         e.status,
         e.enrolled_at
       FROM enrollments e
       JOIN users u ON u.user_id = e.student_id
       WHERE e.course_id = $1
       ORDER BY u.last_name, u.first_name`,
      [courseId]
    );

    res.json({ success: true, students: result.rows });
  } catch (error) {
    next(error);
  }
}

async function enrollStudent(req, res, next) {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: "INVALID_REQUEST",
        message: "studentId is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET status = 'active'
       RETURNING *`,
      [studentId, courseId]
    );

    res.status(201).json({
      success: true,
      enrollment: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCourses,
  getCourse,
  listSessions,
  createSession,
  listStudents,
  enrollStudent
};
