import { runEndPoint } from "./ApiUtils.js"
import { getUserData, injectUserData } from "./User.js";
import { getKeyTranslation, injectElementTranslations, injectTranslations } from "./modules/translationsModule/translationsModule.js";

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
			e.disabled = true;
		});
		headers.forEach(e => {
			e.hidden = false;
		});
	}
	else {
		elements.forEach(e => {
			e.disabled = false;
		});
		headers.forEach(e => {
			e.hidden = true;
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

async function showAlert(message, success, button) {
	success = success === true || success === 'true';
	var bgColor = success ? "text-bg-success" : "text-bg-danger";
	var alertDiv = document.getElementById("alertContainer");
	var currentdate = new Date();
	var minutes = currentdate.getMinutes();
	var datetime = currentdate.getHours() + ":" + (minutes < 10 ? "0" : "") + minutes;

	alertDiv.innerHTML += `
	<div id="alert${alertId}" class="notification d-flex flex-column mt-2">
		<div class="notification-header ${bgColor} text-white d-flex justify-content-between align-items-center px-3 py-2">
		<strong class="me-auto">${success ? "Information" : "Error"}</strong>
		<small me-2>${datetime}</small>
		<button type="button" class="ms-2 btn-close btn-close-white" onclick="this.parentNode.parentNode.remove();"></button>
		</div>
		<div class="notification-body px-3 py-2">
			${await getKeyTranslation(message)}
		</div>
	</div>
	`;
	if (button)
		alertDiv.querySelector(`#alert${alertId} .notification-body`).appendChild(button);

	setTimeout((function (id) {
		return function () {
			removeAlert(document.getElementById(`alert${id}`));
		}
	})(alertId), 5000);
	alertId++;
}

function removeAlert(alertDiv) {
	if (alertDiv) {
		alertDiv.style.opacity = 0;
		setTimeout(() => {
			alertDiv.remove();
		}, 500);
	}
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

function setEditButtonProfile(status) {
	var editProfileBtnId = 'editProfileBtn'; 
	var button = document.getElementById(editProfileBtnId);

	if (button) {
		button.disabled = status;
	}
}

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
	setEditButtonProfile,
	disable42LoginElements
};
