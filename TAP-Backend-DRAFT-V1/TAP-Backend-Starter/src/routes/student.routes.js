const express = require("express");
const studentController = require("../controllers/student.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/:studentId/face/enroll",
  upload.single("faceImage"),
  studentController.enrollFace
);

module.exports = router;
