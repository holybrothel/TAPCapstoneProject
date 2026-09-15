const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("role");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (email === "" || password === "") {
        message.textContent = "Please enter your email and password.";
        message.style.color = "#b42318";
        return;
    }

    message.style.color = "#2f7d4a";

    if (role === "student") {
    message.textContent = "Student login successful.";

    setTimeout(function () {
        window.location.href = "student.html";
    }, 700);

} else {
    message.textContent = "Instructor login successful.";
}

});