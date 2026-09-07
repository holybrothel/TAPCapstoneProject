const express = require("express");
const sessionController = require("../controllers/session.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/:sessionId", sessionController.getSession);
router.get("/:sessionId/attendance", sessionController.getAttendance);
router.post(
  "/:sessionId/check-in",
  upload.single("faceImage"),
  sessionController.checkIn
);

module.exports = router;
