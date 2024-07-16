import { updatePassword, updateProfile, updateProfileWithPassword } from "../ApiCalls.js";
import { togglePasswordVisibility, checkPassword } from "../Utils.js";
import { resetForm, inputInitListeners } from "../DashboardUtils.js"
import { initSessionWs } from "../User.js";
import { printQueryParamsMessage } from "../modules/translationsModule/translationsModule.js";

export async function init(queryParams) {
	initSessionWs();
	printQueryParamsMessage(queryParams);

	var modal = document.getElementById("updateProfileModal");

	var saveChangesButton = modal.querySelector("#saveChangesButton");
	var discardChangesButton = modal.querySelector("#discardChangesButton");
	var confirmPasswordButton = document.querySelector("#confirmPasswordButton");
	var updatePasswordButton = document.querySelector("#updatePasswordButton");
	var password1 = document.querySelector("#updatePasswordFirstPassword");
	var password2 = document.querySelector("#updatePasswordSecondPassword");

	inputInitListeners();

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
