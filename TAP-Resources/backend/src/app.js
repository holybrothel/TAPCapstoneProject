const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const courseRoutes = require("./routes/course.routes");
const sessionRoutes = require("./routes/session.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/students", studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "FILE_TOO_LARGE",
      message: "Face image is too large"
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Unexpected server error"
  });
});

module.exports = app;
