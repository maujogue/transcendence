import { register, login, logout } from "./ApiCalls.js";
import { togglePasswordVisibility, checkPassword } from "./Utils.js";
import { injectModule } from "./Modules.js";

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
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(loginForm);
});

//logout button fetch launcher
var logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", (e) => logout());

//register button fetch launcher
var registerForm = document.getElementById("registrationForm");
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  register(registerForm);
});

//check password on register input
var password1 = document.getElementById("registerPassword");
var password2 = document.getElementById("registerPasswordAgain");

password1.addEventListener("input", (event) =>
  checkPassword("register", password1, password2)
);
password2.addEventListener("input", (event) =>
  checkPassword("register", password1, password2)
);

//password visibility toggles (login/register)
togglePasswordVisibility("loginPasswordToggle", "loginPassword");
togglePasswordVisibility("registerPasswordToggle", "registerPassword");
togglePasswordVisibility(
  "registerPasswordAgainToggle",
  "registerPasswordAgain"
);

injectModule('usernameInput', "register");
injectModule('emailInput', "register");
