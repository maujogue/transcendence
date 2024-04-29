import { navigateTo, logIn } from "./Router.js";
import { showAlert } from "./Utils.js";
import { getUserData } from "./User.js";
import { get_csrf_token, runEndPoint, updateInfo } from "./ApiUtils.js"
import { getSubmittedInput, toggleConfirmPasswordModal } from "./DashboardUtils.js";

async function register(registerForm) {
	const userData = new FormData(registerForm);
	const fetchBody = {
		username: userData.get("username"),
		email: userData.get("email"),
		password1: userData.get("password"),
		password2: userData.get("passwordagain"),
	};

	var response = await runEndPoint(
		"users/register/",
		JSON.stringify(fetchBody)
	);
	var data = response.data;

	if (response.statusCode === 200) {
		showAlert("Registered, you can now Login", "success");
	} else {
		if (data.error && data.error.length > 0) showAlert(data.error[0]);
		else showAlert("Register Error");
	}
}

async function login(loginForm) {
	const userData = new FormData(loginForm);
	const fetchBody = {
		username: userData.get("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/login/", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		Cookies.set("isLoggedIn", "true");
		document.dispatchEvent(logIn);
		bootstrap.Modal.getInstance(document.getElementById("login")).hide();
		navigateTo("/dash");
	} else {
		showAlert("Username or Password incorrect");
	}
}

async function logout() {
	var response = await runEndPoint("users/logout/");
	if (response.statusCode === 200) {
		Cookies.remove("isLoggedIn");
		navigateTo("/dash");
	}
}

async function updatePassword(updatePasswordForm) {
	var updatePasswordForm = document.getElementById("updatePasswordForm");
	const userData = new FormData(updatePasswordForm);
	const fetchBody = {
		username: await getUserData("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/login/", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		const fetchBody = {
			new_password1: userData.get("new_password1"),
			new_password2: userData.get("new_password2"),
		};
		updateInfo(
			"users/update_password/",
			JSON.stringify(fetchBody),
			"updatePasswordModal"
		);
	} else {
		showAlert("Password Incorrect, try again.");
	}
	document.getElementById("updatePasswordCurrentPassword").value = "";
	document.getElementById("updatePasswordFirstPassword").value = "";
	document.getElementById("updatePasswordSecondPassword").value = "";
}

async function updateUsername(updateUsernameForm) {
	const userData = new FormData(updateUsernameForm);
	const fetchBody = {
		username: await getUserData("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/login/", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		const fetchBody = {
			username: userData.get("username"),
		};
		console.log(userData.get("username"));
		updateInfo(
			"users/update_username/",
			JSON.stringify(fetchBody),
			"confirmPasswordModal"
		);
	} else {
		showAlert("Password Incorrect, try again.");
	}
}

function updateProfile() {
	var updateProfileForm = document.getElementById("updateProfileForm");
	var inputName = getSubmittedInput().getAttribute("name");
	var formData = new FormData(updateProfileForm);
	var fileInput = document.getElementById("avatar");

	if (inputName == "username" || inputName == "email") {
		toggleConfirmPasswordModal("confirmPasswordModal");
	}
	else if (inputName == "bio") {
		const fetchBody = {
			bio: formData.get("bio"),
		};
		updateInfo("users/update_bio/", JSON.stringify(fetchBody));
	}
	else if (inputName == "avatar" && fileInput.files.length == 1) {
		formData.append("image", fileInput.files[0]);
		updateInfo("users/update_profile_picture/", formData);
	}
}

function updateProfileWithPassword() {
	var updateProfileForm = document.getElementById("updateProfileForm");

	var inputName = getSubmittedInput().getAttribute("name");

	if (inputName == "username")
		updateUsername(updateProfileForm);
	document.getElementById("confirmPasswordPassword").value = "";
}

async function checkInputAvailable(input, type) {
	var response;
	const fetchBody = {
		email: input,
		username: input,
	};
	if (type === "username")
		response = await runEndPoint("users/username_available/", JSON.stringify(fetchBody));
	else if (type === "email")
		response = await runEndPoint("users/email_available/", JSON.stringify(fetchBody));
	if (response.statusCode === 200) {
		return (true)
	} else {
		return (false);
	}
}

export {
	checkInputAvailable,
	register,
	login,
	logout,
	updateInfo,
	updatePassword,
	updateUsername,
	updateProfile,
	updateProfileWithPassword,
	get_csrf_token,
};
