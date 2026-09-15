const API_BASE_URL = "http://localhost:3000/api";

const sessionForm = document.getElementById("session-form");
const courseSelect = document.getElementById("instructor-course");
const attendanceSessionSelect = document.getElementById("attendance-session");
const sessionNameInput = document.getElementById("session-name");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");
const locationInput = document.getElementById("session-location-input");
const sessionMessage = document.getElementById("session-message");

sessionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const course = courseSelect.value;
    const sessionName = sessionNameInput.value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const location = locationInput.value.trim();

    if (!course || !sessionName || !startTime || !endTime || !location) {
        sessionMessage.textContent =
            "Please complete all session information.";

        sessionMessage.style.color = "#b42318";
        return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
        sessionMessage.textContent =
            "End time must be after the start time.";

        sessionMessage.style.color = "#b42318";
        return;
    }

    try {
        sessionMessage.textContent = "Creating session...";
        sessionMessage.style.color = "#666";

        const response = await fetch(
            `${API_BASE_URL}/courses/${course}/sessions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sessionName: sessionName,
                    startTime: startTime,
                    endTime: endTime,
                    location: location,
                    createdBy: 1,
                    status: "active"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not create session.");
        }

        sessionMessage.textContent =
            `Session "${sessionName}" created successfully.`;

        sessionMessage.style.color = "#2f8f57";

        sessionForm.reset();

        await loadSessions(course);

    } catch (error) {
        console.error("Session creation error:", error);

        sessionMessage.textContent =
            error.message || "Could not create session.";

        sessionMessage.style.color = "#b42318";
    }
});

const studentSearchInput = document.getElementById("student-search");
const studentRows = document.querySelectorAll(".student-row");

studentSearchInput.addEventListener("input", function () {
    const searchTerm = studentSearchInput.value.toLowerCase().trim();

    studentRows.forEach(function (student) {
        const studentText = student.textContent.toLowerCase();

        if (studentText.includes(searchTerm)) {
            student.style.display = "flex";
        } else {
            student.style.display = "none";
        }
    });
});

async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);

        if (!response.ok) {
            throw new Error("Could not load courses.");
        }

        const data = await response.json();
const courses = data.courses;

        courseSelect.innerHTML = '<option value="">Choose a course</option>';

        courses.forEach(function (course) {
            const option = document.createElement("option");

            option.value = course.course_id;
option.textContent = `${course.course_code} - ${course.course_name}`;

            courseSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Course loading error:", error);
    }
}

loadCourses();

courseSelect.addEventListener("change", function () {
    const courseId = courseSelect.value;

    if (courseId) {
        loadSessions(courseId);
    }
});

async function loadSessions(courseId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/courses/${courseId}/sessions`
        );

        if (!response.ok) {
            throw new Error("Could not load sessions.");
        }

        const data = await response.json();
        const sessions = data.sessions;

attendanceSessionSelect.innerHTML =
    '<option value="">Choose a session</option>';

sessions.forEach(function (session) {
    const option = document.createElement("option");

    option.value = session.session_id;
    option.textContent = session.session_name;

    attendanceSessionSelect.appendChild(option);
});

    } catch (error) {
        console.error("Session loading error:", error);
    }
}