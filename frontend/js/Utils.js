function isLoggedIn() {
	if (Cookies.get("isLoggedIn") === "true") return true;
	else return false;
}

function toggleContentOnLogState() {
	const logInContent = document.querySelectorAll(".logInContent");
	const logOutContent = document.querySelectorAll(".logOutContent");

	if (isLoggedIn()) {
		logInContent.forEach((e) => (e.style.display = "block"));
		logOutContent.forEach((e) => (e.style.display = "none"));
	} else {
		logInContent.forEach((e) => (e.style.display = "none"));
		logOutContent.forEach((e) => (e.style.display = "block"));
	}
	disableCollapsedSidebar();
}

function disableCollapsedSidebar() {
	const sidebar = document.getElementById("sidebar");
	const content = document.getElementById("content-container");
	if (!isLoggedIn()) {
		sidebar.classList.remove("collapsed");
		content.classList.remove("collapsed");
		var sectionNames = document.querySelectorAll(".section-name");
		sectionNames.forEach(function (name) {
			name.classList.remove("section-name-collapsed");
		});
	}
}

function showAlert(message, success) {
	var alertDiv = document.createElement("div");
	var bgColor = success ? "alert-success" : "alert-danger";
	alertDiv.className = "alert d-flex align-items-center";
	alertDiv.classList.add(bgColor);
	alertDiv.setAttribute("role", "alert");
	var messageDiv = document.createElement("div");
	messageDiv.textContent = message;
	var button = document.createElement("div");
	button.innerHTML = `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

	alertDiv.appendChild(messageDiv);
	alertDiv.appendChild(button);

	alertDiv.style.position = "fixed";
	alertDiv.style.top = "20px";
	alertDiv.style.left = "50%";
	alertDiv.style.transform = "translateX(-50%)";
	alertDiv.style.transition = 'top 0.5s ease-in-out';
	alertDiv.style.zIndex = "1060";

	button.style.marginLeft = '20px';

	document.body.insertBefore(alertDiv, document.body.firstChild);
	setTimeout(function () {
		alertDiv.remove();
	}, 5000);
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

export {
	toggleContentOnLogState,
	showAlert,
	isLoggedIn,
	togglePasswordVisibility,
	checkPassword,
};
