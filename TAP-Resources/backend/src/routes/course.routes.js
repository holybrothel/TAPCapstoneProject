const express = require("express");
const courseController = require("../controllers/course.controller");

const router = express.Router();

router.get("/", courseController.listCourses);
router.get("/:courseId", courseController.getCourse);
router.get("/:courseId/sessions", courseController.listSessions);
router.post("/:courseId/sessions", courseController.createSession);
router.get("/:courseId/students", courseController.listStudents);
router.post("/:courseId/enrollments", courseController.enrollStudent);

module.exports = router;
