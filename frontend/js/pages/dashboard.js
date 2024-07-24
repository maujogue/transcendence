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
	var updateProfileForm = modal.querySelector("#updateProfileForm");
	var confirmPasswordButton = document.querySelector("#confirmPasswordButton");
	var confirmPasswordPassword = document.querySelector("#confirmPasswordPassword");
	var updatePasswordButton = document.querySelector("#updatePasswordButton");
	var password1 = document.querySelector("#updatePasswordFirstPassword");
	var password2 = document.querySelector("#updatePasswordSecondPassword");

	inputInitListeners();

	updatePasswordButton.addEventListener("click", () => updatePassword());
	discardChangesButton.addEventListener("click", () => resetForm());
	saveChangesButton.addEventListener("click", () => updateProfile());
	updateProfileForm.addEventListener("submit", (e) => e.preventDefault());
	confirmPasswordButton.addEventListener("click", () => updateProfileWithPassword());
	confirmPasswordPassword.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			updateProfileWithPassword();
		}
	});
	
	password1.addEventListener("input", () => checkPassword("update", password1, password2));
	password2.addEventListener("input", () => checkPassword("update", password1, password2));
	togglePasswordVisibility("confirmPasswordToggle", "confirmPasswordPassword");
	togglePasswordVisibility("updatePasswordCurrentPasswordToggle", "updatePasswordCurrentPassword");
	togglePasswordVisibility("updatePasswordFirstPasswordToggle", "updatePasswordFirstPassword");
	togglePasswordVisibility("updatePasswordSecondPasswordToggle", "updatePasswordSecondPassword");
}
