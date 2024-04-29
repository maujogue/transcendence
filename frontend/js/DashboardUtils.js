import { injectUserData } from "./User.js";
import { checkInputAvailable } from "./ApiCalls.js";

async function enableDisableSaveButtonOnInput(input, userData) {
	if (input.value !== userData[input.name]) {
		disableFormInputs(input);
	}
	else
		resetForm(input);
}

function resetForm(input) {
	var formInputs = document.querySelectorAll(".formInputs");
	var saveChangesButton = document.getElementById("saveChangesButton");
	var discardChangesButton = document.getElementById("discardChangesButton");
	var updatePasswordButton = document.getElementById("updatePassword");

	injectUserData();
	formInputs.forEach((elm) => {
		if (elm != input)
			elm.disabled = false;
		if (elm.classList.contains("is-valid"))
			elm.classList.remove("is-valid")
		if (elm.classList.contains("is-invalid"))
			elm.classList.remove("is-invalid")
	});
	discardChangesButton.classList.add("d-none");
	updatePasswordButton.classList.remove("d-none");
	saveChangesButton.classList.add("disabled");
}

function disableFormInputs(input) {
	var formInputs = document.querySelectorAll(".formInputs");
	var saveChangesButton = document.getElementById("saveChangesButton");
	var discardChangesButton = document.getElementById("discardChangesButton");
	var updatePasswordButton = document.getElementById("updatePassword");

	formInputs.forEach((elm) => {
		if (elm != input)
			elm.disabled = true;
	});
	if (!input.classList.contains("is-invalid"))
		saveChangesButton.classList.remove("disabled");
	else
		saveChangesButton.classList.add("disabled");
	discardChangesButton.classList.remove("d-none");
	updatePasswordButton.classList.add("d-none");
}


function getSubmittedInput() {
	var formInputs = document.querySelectorAll(".formInputs");
	var inputsArray = Array.from(formInputs);
	return inputsArray.find((input) => !input.hasAttribute("disabled"));
}

function toggleConfirmPasswordModal(modalToDismiss) {
	var updateProfileModal = document.getElementById("updateProfileModal");
	bootstrap.Modal.getInstance(updateProfileModal).toggle();
	if (modalToDismiss) {
		var confirmPassword = document.getElementById(modalToDismiss);
		var confirmPasswordModal = bootstrap.Modal.getInstance(confirmPassword);
		if (confirmPasswordModal instanceof bootstrap.Modal)
			confirmPasswordModal.toggle();
		else {
			confirmPasswordModal = new bootstrap.Modal(confirmPassword);
			confirmPasswordModal.toggle();
		}
	}
}

export {
	enableDisableSaveButtonOnInput,
	disableFormInputs,
	getSubmittedInput,
	resetForm,
	toggleConfirmPasswordModal
};
