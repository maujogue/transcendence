import { register, login, logout } from "./ApiCalls.js";

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

var navlist = document.getElementById("navList");
navlist.addEventListener("click", (e) => {
  let target = e.target.closest("a");
  document.querySelector("a.active").classList.remove("active");
  target.classList.add("active");
});

var logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", (e) => logout());

var registerForm = document.getElementById("registrationForm");
registerForm.addEventListener("submit", (event) =>
  register(event, registerForm)
);

var loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (event) => login(event, loginForm));

var password1 = document.getElementById("passwordRegister");
password1.addEventListener("input", (event) => checkPassword());

var password2 = document.getElementById("passwordagain");
password2.addEventListener("input", (event) => checkPassword());

function checkPassword() {
  var registerPassLength = document.getElementById("registerPassLength");
  var registerPassLowercase = document.getElementById("registerPassLowercase");
  var registerPassUppercase = document.getElementById("registerPassUppercase");
  var registerPassNumbers = document.getElementById("registerPassNumbers");
  var registerPassSpecial = document.getElementById("registerPassSpecial");

  var helpTextAgain = document.getElementById("passwordagainHelpBlock");

  if (/^.{8,20}$/.test(password1.value))
    registerPassLength.style.color = "green";
  else registerPassLength.style.color = "red";
  if (/^.*[a-z].*$/.test(password1.value))
    registerPassLowercase.style.color = "green";
  else registerPassLowercase.style.color = "red";
  if (/^.*[A-Z].*$/.test(password1.value))
    registerPassUppercase.style.color = "green";
  else registerPassUppercase.style.color = "red";
  if (/^.*[0-9].*$/.test(password1.value))
    registerPassNumbers.style.color = "green";
  else registerPassNumbers.style.color = "red";
  if (/^.*[!@#$%^&*_=+].*$/.test(password1.value))
    registerPassSpecial.style.color = "green";
  else registerPassSpecial.style.color = "red";

  if (password2.value !== "" && password1.value !== password2.value)
    helpTextAgain.classList.remove("d-none");
  else helpTextAgain.classList.add("d-none");
}
