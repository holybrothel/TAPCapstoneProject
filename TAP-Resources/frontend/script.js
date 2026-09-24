const loginForm = document.getElementById("login-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("role");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (name === "" || email === "" || password === "") {
        message.textContent = "Please enter your name, email, and password.";
        message.style.color = "#b42318";
        return;
    }

    message.style.color = "#2f7d4a";

    if (role === "student") {
        localStorage.setItem("studentName", name);
    message.textContent = "Student login successful.";

    setTimeout(function () {
        window.location.href = "student.html";
    }, 700);

} else {
    message.textContent = "Instructor login successful.";
}

});