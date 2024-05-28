import { updatePassword, updateProfile, updateProfileWithPassword } from "../ApiCalls.js";
import { togglePasswordVisibility, checkPassword, showAlert, printQueryParamsMessage } from "../Utils.js";
import { enableDisableSaveButtonOnInput, resetForm } from "../DashboardUtils.js"
import { getUserData } from "../User.js";

export async function init(queryParams) {
	printQueryParamsMessage(queryParams);
	history.pushState({}, null, "/dash");

	var modal = document.getElementById("updateProfileModal");
	var formInputs = modal.querySelectorAll(".formInputs");
	var userData = await getUserData();
	formInputs.forEach((input) => {
		input.addEventListener("input", () => enableDisableSaveButtonOnInput(input, userData))
	});
	var saveChangesButton = modal.querySelector("#saveChangesButton");
	var discardChangesButton = modal.querySelector("#discardChangesButton");
	var confirmPasswordButton = document.querySelector("#confirmPasswordButton");
	var updatePasswordButton = document.querySelector("#updatePasswordButton");
	var password1 = document.querySelector("#updatePasswordFirstPassword");
	var password2 = document.querySelector("#updatePasswordSecondPassword");

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
