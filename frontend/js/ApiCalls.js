import { navigateTo, initPages } from "./Router.js";
import { showAlert } from "./Utils.js";
import { getUserData, injectUserData,  } from "./User.js";
import { get_csrf_token, runEndPoint, updateInfo } from "./ApiUtils.js"
import { getSubmittedInput, toggleConfirmPasswordModal } from "./DashboardUtils.js";
import { toggleContentOnLogState } from "./Utils.js";
import { closeWs } from "./modules/friendList/friendsWs.js";

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
		"POST",
		JSON.stringify(fetchBody)
	);
	var data = response.data;

	if (response.statusCode === 200) {
		showAlert(response.data.status, true);
	} else {
		if (data.error.password2)
			showAlert(data.error.password2[0]);
		else if (data.error && typeof(data.error[0]) === "string") showAlert(data.error[0]);
		else showAlert("An error occurred, please try again.");
	}
}

async function login(loginForm) {
	const userData = new FormData(loginForm);
	const fetchBody = {
		username: userData.get("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/login/", "POST", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		bootstrap.Modal.getInstance(document.getElementById("login")).hide();
		await initPages();
		await navigateTo("/dash");
	} else {
		showAlert(response.data.error);
	}
}

async function logout() {
	var response = await runEndPoint("users/logout/", "POST",);
	if (response.statusCode === 200) {
		closeWs();
		await initPages();
		await navigateTo("/dash");
	}
}

async function updatePassword(updatePasswordForm) {
	var updatePasswordForm = document.getElementById("updatePasswordForm");
	const userData = new FormData(updatePasswordForm);
	const fetchBody = {
		username: await getUserData("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/check_password/", "POST", JSON.stringify(fetchBody));

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

	var response = await runEndPoint("users/check_password/", "POST", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		const fetchBody = {
			username: userData.get("username"),
		};
		updateInfo(
			"users/update_username/",
			JSON.stringify(fetchBody),
			"confirmPasswordModal"
		);
	} else {
		showAlert("Password Incorrect, try again.");
	}
}

async function updateEmail(updateEmailForm) {
	const userData = new FormData(updateEmailForm);
	const fetchBody = {
		username: await getUserData("username"),
		password: userData.get("password"),
	};

	var response = await runEndPoint("users/check_password/", "POST", JSON.stringify(fetchBody));

	if (response.statusCode === 200) {
		const fetchBody = {
			email: userData.get("email"),
		};
		updateInfo(
			"users/update_email/",
			JSON.stringify(fetchBody),
			"confirmPasswordModal"
		);
		checkEmailValidation5minutes();
	} else {
		showAlert("Password Incorrect, try again.");
	}
}

async function checkEmailValidation5minutes() {
	var currentEmail = await getUserData("email");
	var intervalId = setInterval(async () => {
		if (currentEmail !== await getUserData("email")) {
			injectUserData();
			clearInterval(intervalId);
	}
	}, 1000);
	setTimeout(() => clearInterval(intervalId), 60000 * 5);
}

function updateProfile() {
	var updateProfileForm = document.getElementById("updateProfileForm");
	var inputName = getSubmittedInput().getAttribute("name");
	var formData = new FormData(updateProfileForm);
	var avatarInput = document.getElementById("avatar");
	var bannerInput = document.getElementById("banner");
	if (inputName == "username" || inputName == "email") {
		toggleConfirmPasswordModal("confirmPasswordModal");
	}
	else if (inputName == "tournament_username") {
		const fetchBody = {
			tournament_username: formData.get("tournament_username"),
		};
		updateInfo("users/update_tournament_name/", JSON.stringify(fetchBody));
	}
	else if (inputName == "bio") {
		const fetchBody = {
			bio: formData.get("bio"),
		};
		updateInfo("users/update_bio/", JSON.stringify(fetchBody));
	}
	else if (inputName == "avatar" && avatarInput.files.length == 1) {
		formData.append("image", avatarInput.files[0]);
		updateInfo("users/update_profile_picture/", formData);
	}
	else if (inputName == "banner" && bannerInput.files.length == 1) {
		formData.append("image", bannerInput.files[0]);
		updateInfo("users/update_profile_banner/", formData);
	}
}

function updateProfileWithPassword() {
	var updateProfileForm = document.getElementById("updateProfileForm");

	var inputName = getSubmittedInput().getAttribute("name");

	if (inputName == "username")
		updateUsername(updateProfileForm);
	if (inputName == "email")
		updateEmail(updateProfileForm);
	document.getElementById("confirmPasswordPassword").value = "";
}

async function checkInputAvailable(input, type) {
	var response;
	const fetchBody = {
		email: input,
		username: input,
	};
	if (type === "username")
		response = await runEndPoint("users/username_available/", "POST", JSON.stringify(fetchBody));
	else if (type === "email")
		response = await runEndPoint("users/email_available/", "POST", JSON.stringify(fetchBody));
	else if (type === "tournament_username")
		response = await runEndPoint("users/tournament_username_available/", "POST", JSON.stringify(fetchBody));
	if (response.data.status === "success") {
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
