import { register, login, logout } from "./ApiCalls.js";
import { togglePasswordVisibility, checkPassword } from "./Utils.js";
import { injectModule } from "./Modules.js";

init();

function init() {
	const collapseButton = document.getElementById("collapseButton");
	var loginForm = document.getElementById("loginForm");
	var logoutButton = document.getElementById("logoutButton");
	var registerForm = document.getElementById("registrationForm");
	var password1 = document.getElementById("registerPassword");
	var password2 = document.getElementById("registerPasswordAgain");

	collapseButton.addEventListener("click", toggleSidebarCollapse);
	logoutButton.addEventListener("click", () => logout());
	loginForm.addEventListener("submit", (event) => {
		event.preventDefault();
		login(loginForm);
	});
	registerForm.addEventListener("submit", (event) => {
		event.preventDefault();
		register(registerForm);
	});
	password1.addEventListener("input", (event) =>
		checkPassword("register", password1, password2)
	);
	password2.addEventListener("input", (event) =>
		checkPassword("register", password1, password2)
	);
	togglePasswordVisibility("loginPasswordToggle", "loginPassword");
	togglePasswordVisibility("registerPasswordToggle", "registerPassword");
	togglePasswordVisibility("registerPasswordAgainToggle", "registerPasswordAgain");
}

function toggleSidebarCollapse() {
	const sidebar = document.getElementById("sidebar");
	const content = document.getElementById("content-container");
	var sectionNames = document.querySelectorAll(".section-name");

	sidebar.classList.toggle("collapsed");
	content.classList.toggle("collapsed");
	sectionNames.forEach(function (name) {
		name.classList.toggle("section-name-collapsed");
	});
}
