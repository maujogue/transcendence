import { register, login, logout } from "../ApiCalls.js";
import { toggleModal } from "../DashboardUtils.js";
import { togglePasswordVisibility, checkPassword, toggleSearchBar } from "../Utils.js";
import { printQueryParamsMessage } from "../modules/translationsModule/translationsModule.js";

export function init(queryParams) {
	printQueryParamsMessage(queryParams);
	const collapseButton = document.getElementById("collapseButton");
	var loginForm = document.getElementById("loginForm");
	var logoutButton = document.getElementById("logoutButton");
	var registerForm = document.getElementById("registrationForm");
	var password1 = document.getElementById("registerPassword");
	var password2 = document.getElementById("registerPasswordAgain");

	resizeSidebarOnWidth();
	window.addEventListener('resize', resizeSidebarOnWidth);
	collapseButton.addEventListener("click", () => {toggleSidebarCollapse();});
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

var windowPreviousWidth = window.innerWidth;
function resizeSidebarOnWidth(){
	if (window.innerWidth < 768)
		toggleSidebarCollapse(true);
	else if (window.innerWidth > 768 && windowPreviousWidth < 768)
		toggleSidebarCollapse(false);
	windowPreviousWidth = window.innerWidth;
}

function toggleSidebarCollapse(state) {
	const sidebar = document.getElementById("sidebar");
	const content = document.getElementById("content-container");
	var sectionNames = document.querySelectorAll(".section-name");

	if (state == true) {
		sidebar.classList.add("collapsed");
		content.classList.add("collapsed");
		sectionNames.forEach(function (name) {
			name.classList.add("section-name-collapsed");
		});
		toggleSearchBar(true);
		return;
	}
	if (state == false) {
		sidebar.classList.remove("collapsed");
		content.classList.remove("collapsed");
		sectionNames.forEach(function (name) {
			name.classList.remove("section-name-collapsed");
		});
		toggleSearchBar(true);
		return;
	}
	else {
		sidebar.classList.toggle("collapsed");
		content.classList.toggle("collapsed");
		sectionNames.forEach(function (name) {
			name.classList.toggle("section-name-collapsed");
		});
		toggleSearchBar();
		return;
	}
}

export { toggleSidebarCollapse };