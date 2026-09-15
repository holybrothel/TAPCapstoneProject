const startCameraButton = document.getElementById("start-camera-button");
const camera = document.getElementById("camera");
const cameraPlaceholder = document.getElementById("camera-placeholder");

startCameraButton.addEventListener("click", async function () {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        camera.srcObject = stream;

        camera.style.display = "block";
        cameraPlaceholder.style.display = "none";

        startCameraButton.textContent = "Camera Active";
        startCameraButton.disabled = true;

    } catch (error) {
        console.error("Camera error:", error);

        alert(
            "T.A.P. could not access your camera. Please allow camera permission in your browser and try again."
        );
    }
});

const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", function () {
    window.location.href = "index.html";
});

const sessionSelect = document.getElementById("session-select");
const sessionCourse = document.getElementById("session-course");
const sessionLocation = document.getElementById("session-location");
const sessionTime = document.getElementById("session-time");
const sessionStatus = document.getElementById("session-status");

sessionSelect.addEventListener("change", function () {
    const selectedSession = sessionSelect.value;

    if (selectedSession === "1") {
        sessionCourse.textContent = "CS 499";
        sessionLocation.textContent = "Room 101";
        sessionTime.textContent = "11:00 AM – 12:15 PM";

        sessionStatus.innerHTML = `
            <span></span>
            Active Session
        `;
    } else {
        sessionCourse.textContent = "—";
        sessionLocation.textContent = "—";
        sessionTime.textContent = "—";
        sessionStatus.textContent = "Select a session to view details";
    }
});

const checkinButton = document.getElementById("checkin-button");
const checkinMessage = document.getElementById("checkin-message");
const captureCanvas = document.getElementById("capture-canvas");

checkinButton.addEventListener("click", function () {
    const selectedSession = sessionSelect.value;

    if (selectedSession === "") {
        checkinMessage.textContent = "Please select an active session first.";
        checkinMessage.style.color = "#b42318";
        return;
    }

    if (!camera.srcObject) {
        checkinMessage.textContent = "Please start the camera before checking in.";
        checkinMessage.style.color = "#b42318";
        return;
    }

    const context = captureCanvas.getContext("2d");

    captureCanvas.width = camera.videoWidth;
    captureCanvas.height = camera.videoHeight;

    context.drawImage(
        camera,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    checkinMessage.textContent = "Submitting attendance...";
    checkinMessage.style.color = "#6f1633";

    captureCanvas.toBlob(async function (blob) {
        if (!blob) {
            checkinMessage.textContent = "Could not capture image. Please try again.";
            checkinMessage.style.color = "#b42318";
            return;
        }

        const formData = new FormData();

        formData.append(
            "faceImage",
            blob,
            "checkin-photo.jpg"
        );

        try {
            const response = await fetch(
                `http://localhost:3000/api/sessions/${selectedSession}/check-in`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Check-in failed."
                );
            }

            checkinMessage.textContent =
                `Check-in successful for ${data.student?.name || "student"}!`;

            checkinMessage.style.color = "#2f8f57";

        } catch (error) {
            console.error("Check-in error:", error);

            checkinMessage.textContent =
                "Could not connect to the attendance server.";

            checkinMessage.style.color = "#b42318";
        }
    }, "image/jpeg", 0.9);
});