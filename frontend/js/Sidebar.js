import { register, login, logout } from "./ApiCalls.js";

//collapse sidebar on click
const collapseButton = document.getElementById("collapseButton");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content-container");

collapseButton.addEventListener("click", toggleSidebarCollapse);

function toggleSidebarCollapse() {
  sidebar.classList.toggle("collapsed");
  content.classList.toggle("collapsed");
  var sectionNames = document.querySelectorAll(".section-name");
  sectionNames.forEach(function (name) {
    name.classList.toggle("section-name-collapsed");
  });
}

//navbar active button switcher
var navlist = document.getElementById("navList");
navlist.addEventListener("click", (e) => {
  let target = e.target.closest("a");
  document.querySelector("a.active").classList.remove("active");
  target.classList.add("active");
});

//login button fetch launcher
var loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (event) => login(event, loginForm));

//logout button fetch launcher
var logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", (e) => logout());

//register button fetch launcher
var registerForm = document.getElementById("registrationForm");
registerForm.addEventListener("submit", (event) =>
  register(event, registerForm)
);

//check password on register input
var password1 = document.getElementById("registerPassword");
password1.addEventListener("input", (event) => checkPassword());

var password2 = document.getElementById("registerPasswordAgain");
password2.addEventListener("input", (event) => checkPassword());

//check password attribute with given regEx expression
function checkPasswordAttribute(regEx, elementID) {
  var dynamicColorDiv = document.getElementById(elementID);
  if (regEx.test(password1.value)) dynamicColorDiv.style.color = "green";
  else dynamicColorDiv.style.color = "red";
}

function checkPassword() {
  checkPasswordAttribute(/^.{8,20}$/, "registerPassLength");
  checkPasswordAttribute(/^.*[a-z].*$/, "registerPassLowercase");
  checkPasswordAttribute(/^.*[A-Z].*$/, "registerPassUppercase");
  checkPasswordAttribute(/^.*[0-9].*$/, "registerPassNumbers");
  checkPasswordAttribute(/^.*[!@#$%^&*_=+].*$/, "registerPassSpecial");

  var helpTextAgain = document.getElementById("passwordagainHelpBlock");
  if (password2.value !== "" && password1.value !== password2.value)
    helpTextAgain.classList.remove("d-none");
  else helpTextAgain.classList.add("d-none");
}

//password visibility toggles (login/register)
const loginPasswordField = document.getElementById("loginPassword");
const loginPasswordToggle = document.getElementById("loginPasswordToggle");
const registerPasswordField = document.getElementById("registerPassword");
const registerPasswordAgainField = document.getElementById("registerPasswordAgain");
const registerPasswordToggle = document.getElementById("registerPasswordToggle");
const registerPasswordAgainToggle = document.getElementById("registerPasswordAgainToggle");

loginPasswordToggle.addEventListener("click", () => toggleVisibility(loginPasswordToggle, loginPasswordField));
registerPasswordToggle.addEventListener("click", () => toggleVisibility(registerPasswordToggle, registerPasswordField));
registerPasswordAgainToggle.addEventListener("click", () => toggleVisibility(registerPasswordAgainToggle, registerPasswordAgainField));

function toggleVisibility(togglePassword, passwordField) {3
  if (passwordField.type === "password") {
    passwordField.type = "text";
    togglePassword.classList.remove("fa-eye");
    togglePassword.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    togglePassword.classList.remove("fa-eye-slash");
    togglePassword.classList.add("fa-eye");
  }
};
