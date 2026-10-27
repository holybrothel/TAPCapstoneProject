const axios = require("axios");

function isMockMode() {
  return String(process.env.USE_MOCK_FACE).toLowerCase() === "true";
}

async function recognizeFace(file) {
  if (isMockMode()) {
    return {
      matched: true,
      studentId: Number(process.env.MOCK_STUDENT_ID || 2),
      confidence: 0.99,
      source: "mock"
    };
  }

  // IMPORTANT:
  // CompreFace deployments can differ in how subjects and API keys are configured.
  // Replace/adjust this adapter after your team confirms the exact Recognition API
  // endpoint and response format in your local CompreFace instance.
  //
  // Keep the rest of the T.A.P. app unchanged. This service should always return:
  // {
  //   matched: boolean,
  //   studentId: number | null,
  //   confidence: number | null,
  //   source: "compreface"
  // }

  throw Object.assign(
    new Error(
      "Real CompreFace recognition is not wired yet. Set USE_MOCK_FACE=true or implement this adapter."
    ),
    { status: 501, code: "COMPREFACE_NOT_CONFIGURED" }
  );
}

async function enrollFace(studentId, file) {
  if (isMockMode()) {
    return {
      subjectId: `student-${studentId}`,
      source: "mock"
    };
  }

  throw Object.assign(
    new Error(
      "Real CompreFace enrollment is not wired yet. Set USE_MOCK_FACE=true or implement this adapter."
    ),
    { status: 501, code: "COMPREFACE_NOT_CONFIGURED" }
  );
}

module.exports = {
  recognizeFace,
  enrollFace
};
