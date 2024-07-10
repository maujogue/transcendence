import { runEndPoint } from "./ApiUtils.js"
import { getUserData, injectUserData } from "./User.js";

async function isLoggedIn() {
	var response = await runEndPoint("users/check_user_logged_in/", "GET");
	return response.data.is_logged_in;
}

async function check_user_42() {
	return await getUserData("is_42auth");
}

function printQueryParamsMessage(queryParams) {
	if (queryParams && queryParams.get("message"))
		showAlert(queryParams.get("message"), queryParams.get("success"));
}

async function toggleContentOnLogState() {
	const logInContent = document.querySelectorAll(".logInContent");
	const logOutContent = document.querySelectorAll(".logOutContent");

	if (await isLoggedIn()) {
		logInContent.forEach((e) => (e.style.display = "block"));
		logOutContent.forEach((e) => (e.style.display = "none"));
	} else {
		logInContent.forEach((e) => (e.style.display = "none"));
		logOutContent.forEach((e) => (e.style.display = "block"));
	}
	disableCollapsedSidebar();
	disable42LoginElements();
}

function resetModalFormsInitListeners() {
	var modals = document.querySelectorAll('.modal');
	modals.forEach(function (modal) {
		if (!modal.classList.contains('modal-no-reset')) {
			var form = modal.querySelector('form');
			if (!form) return;
			modal.addEventListener('hide.bs.modal', function () {
				form.reset();
				injectUserData();
				form.querySelectorAll('.is-valid').forEach((e) => e.classList.remove('is-valid'));
				form.querySelectorAll('.is-invalid').forEach((e) => e.classList.remove('is-invalid'));
				resetCheckPassword();
			});
		}
	});
}

async function disable42LoginElements() {
	const elements = document.querySelectorAll(".auth-42-disable");
	const headers = document.querySelectorAll(".auth-42-disable-header");
	if (await check_user_42()) {
		elements.forEach(e => {
			e.classList.add("disabled");
		});
		headers.forEach(e => {
			e.innerHTML = "<btn class='btn w-100 bg-warning mb-3 '>You can't modify your username, email or password because you logged in with 42</span>";
		});
	}
	else {
		elements.forEach(e => {
			if (e.classList.contains("disabled"))
				e.classList.remove("disabled");
		});
		headers.forEach(e => {
			e.innerHTML = "";
		});
	}
}


async function disableCollapsedSidebar(forceDisable) {
	const sidebar = document.getElementById("sidebar");
	const content = document.getElementById("content-container");
	if (!(await isLoggedIn()) || forceDisable) {
		sidebar.classList.remove("collapsed");
		content.classList.remove("collapsed");

		toggleSearchBar(forceDisable);
		var sectionNames = document.querySelectorAll(".section-name");
		sectionNames.forEach(function (name) {
			name.classList.remove("section-name-collapsed");
		});
	}
}

function toggleSearchBar(forceDisable) {
	const searchInput = document.querySelector("#searchButton > input");

	if (searchInput.style.opacity == 0 || forceDisable) {
		searchInput.style.opacity = 1;
		setTimeout(() => {
			searchInput.hidden = false;
		}, 100);
	}
	else {
		setTimeout(() => {
			searchInput.hidden = true;
		}, 200);
		searchInput.style.opacity = 0;
	}
}

var alertId = 0;

function showAlert(message, success) {
	success = success === true || success === 'true';
	var bgColor = success ? "text-bg-success" : "text-bg-danger";
	var alertDiv = document.getElementById("alert");
	var currentdate = new Date();
	var minutes = currentdate.getMinutes();
	var datetime = currentdate.getHours() + ":" + (minutes.length === 1 ? "0" + minutes : minutes);
	alertDiv.innerHTML += `
	<div id="alert${alertId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-animation="true" data-bs-delay="3000" style="background-color: whitesmoke !important;">
		<div class="toast-header ${bgColor}">
		<strong class="me-auto">${success ? "Information" : "Error"}</strong>
		<small>${datetime}</small>
		<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
		<div class="toast-body" style="text-wrap: wrap;">
		${message}
		</div>
	</div>
	`;
	var toast = alertDiv.querySelector("#alert" + alertId);
	new bootstrap.Toast(toast).show();
	alertId++;
}

function togglePasswordVisibility(togglePasswordInputId, passwordFieldId) {
	var togglePassword = document.getElementById(togglePasswordInputId);
	var passwordField = document.getElementById(passwordFieldId);
	togglePassword.addEventListener("click", () => {
		if (passwordField.type === "password") {
			passwordField.type = "text";
			togglePassword.classList.remove("fa-eye");
			togglePassword.classList.add("fa-eye-slash");
		} else {
			passwordField.type = "password";
			togglePassword.classList.remove("fa-eye-slash");
			togglePassword.classList.add("fa-eye");
		}
	});
}

function checkPasswordAttribute(regEx, elementID, password) {
	var dynamicColorDiv = document.getElementById(elementID);
	if (regEx.test(password.value)) dynamicColorDiv.style.color = "green";
	else dynamicColorDiv.style.color = "red";
}

function checkPassword(category, password1, password2) {
	checkPasswordAttribute(/^.{8,20}$/, category + "PassLength", password1);
	checkPasswordAttribute(/^.*[a-z].*$/, category + "PassLowercase", password1);
	checkPasswordAttribute(/^.*[A-Z].*$/, category + "PassUppercase", password1);
	checkPasswordAttribute(/^.*[0-9].*$/, category + "PassNumbers", password1);
	checkPasswordAttribute(
		/^.*[!@#$%^&*_=+].*$/,
		category + "PassSpecial",
		password1
	);

	var helpTextAgain = document.getElementById(
		category + "PasswordAgainHelpBlock"
	);
	if (password2.value !== "" && password1.value !== password2.value)
		helpTextAgain.classList.remove("d-none");
	else helpTextAgain.classList.add("d-none");
}

function resetCheckPassword() {
	var checkPasswordLines = document.querySelectorAll(".passwordHelpLine");
	checkPasswordLines.forEach((e) => (e.style.color = "black"));
}

const asyncTimeout = (number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, number);
	});
};

export {
	toggleContentOnLogState,
	showAlert,
	isLoggedIn,
	check_user_42,
	togglePasswordVisibility,
	checkPassword,
	printQueryParamsMessage,
	disableCollapsedSidebar,
	toggleSearchBar,
	resetCheckPassword,
	resetModalFormsInitListeners,
	asyncTimeout,
};
