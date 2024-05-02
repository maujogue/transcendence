import { updatePassword, updateProfile, updateProfileWithPassword } from "./ApiCalls.js";
import { togglePasswordVisibility, checkPassword } from "./Utils.js";
import { enableDisableSaveButtonOnInput, resetForm } from "./DashboardUtils.js"
import { getUserData } from "./User.js";
import { injectModule } from "./Modules.js";

init();

async function init() {
	injectModule('usernameInputModule', 'updateProfileModal');
	injectModule('emailInputModule', 'updateProfileModal');

	var modal = document.getElementById("updateProfileModal");
	var userData = await getUserData();
	var formInputs = modal.querySelectorAll(".formInputs");
	var saveChangesButton = modal.querySelector("#saveChangesButton");
	var discardChangesButton = modal.querySelector("#discardChangesButton");
	var confirmPasswordButton = document.querySelector("#confirmPasswordButton");
	var updatePasswordButton = document.querySelector("#updatePasswordButton");
	var password1 = document.querySelector("#updatePasswordFirstPassword");
	var password2 = document.querySelector("#updatePasswordSecondPassword");

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
