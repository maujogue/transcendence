import { updatePassword, updateProfile, updateProfileWithPassword } from "./ApiCalls.js";
import { togglePasswordVisibility, checkPassword } from "./Utils.js";
import { enableDisableSaveButtonOnInput, resetForm } from "./DashboardUtils.js"
import { getUserData } from "./User.js";
import { injectModule } from "./Modules.js";

init();

async function init() {
	injectModule('usernameInput', document.querySelector(".usernameInput"));


	var userData = await getUserData();
	var formInputs = document.querySelectorAll(".formInputs");
	var saveChangesButton = document.getElementById("saveChangesButton");
	var discardChangesButton = document.getElementById("discardChangesButton");
	var confirmPasswordButton = document.getElementById("confirmPasswordButton");
	var updatePasswordButton = document.getElementById("updatePasswordButton");
	var password1 = document.getElementById("updatePasswordFirstPassword");
	var password2 = document.getElementById("updatePasswordSecondPassword");

	formInputs.forEach((input) => {
		input.addEventListener("input", () => enableDisableSaveButtonOnInput(input, userData))
	});
	updatePasswordButton.addEventListener("click", () => updatePassword());
	discardChangesButton.addEventListener("click", () => resetForm());
	saveChangesButton.addEventListener("click", () => updateProfile());
	confirmPasswordButton.addEventListener("click", () => updateProfileWithPassword());
	
	password1.addEventListener("input", () => checkPassword("update", password1, password2));
	password2.addEventListener("input", () => checkPassword("update", password1, password2));
	togglePasswordVisibility("confirmPasswordToggle", "confirmPasswordPassword");
	togglePasswordVisibility("updatePasswordCurrentPasswordToggle", "updatePasswordCurrentPassword");
	togglePasswordVisibility("updatePasswordFirstPasswordToggle", "updatePasswordFirstPassword");
	togglePasswordVisibility("updatePasswordSecondPasswordToggle", "updatePasswordSecondPassword");
}
