import { updateModule } from "./Modules.js";
import { injectUserData, getUserData } from "./User.js";
import { initListenersEmail } from "./modules/emailInputModule/emailInputModule.js";
import { initListenersTournamentUsername } from "./modules/tournamentUsernameInputModule/tournamentUsernameInputModule.js";
import { initListenersUsername } from "./modules/usernameInputModule/usernameInputModule.js";

function inputInitListeners() {
	var modal = document.getElementById("updateProfileModal");
	var formInputs = modal.querySelectorAll(".formInputs");
	formInputs.forEach((input) => {
		var inputClone = input.cloneNode(true);
		input.parentNode.replaceChild(inputClone, input);
		inputClone.addEventListener("input", enableDisableSaveButtonOnInput);
	});
	initListenersUsername();
	initListenersTournamentUsername();
	initListenersEmail();
}

async function enableDisableSaveButtonOnInput(input) {
	var userData = await getUserData();
	input = input.target;
	if (userData && input.value !== userData[input.name]) {
		disableFormInputs(input);
		disableSaveChangesButton(input);
	} else {
		resetForm(input);
	}
}

function resetForm(input) {
	var formInputs = document.querySelectorAll(".formInputs");
	var saveChangesButton = document.querySelector("#saveChangesButton");
	var discardChangesButton = document.getElementById("discardChangesButton");
	var updatePasswordButton = document.getElementById("updatePassword");
	var closeButton = document.getElementById("closeButtonUpdateProfile");

	injectUserData();
	formInputs.forEach((elm) => {
		if (elm != input)
			elm.disabled = false;
		if (elm.classList.contains("is-valid"))
			elm.classList.remove("is-valid")
		if (elm.classList.contains("is-invalid"))
			elm.classList.remove("is-invalid")
		if (elm.type === "file")
			elm.value = "";
	});
	discardChangesButton.classList.add("d-none");
	updatePasswordButton.classList.remove("d-none");
	saveChangesButton.disabled = true;
	closeButton.classList.remove("d-none");

}

function disableSaveChangesButton(input) {
	var modal = input.closest(".modal");
	var saveChangesButton = modal.querySelector("#saveChangesButton");
	if (saveChangesButton) {
		if (!input.classList.contains("is-invalid"))
			saveChangesButton.disabled = false;
		else
			saveChangesButton.disabled = true;
	}
}

function disableFormInputs(input) {
	var formInputs = document.querySelectorAll(".formInputs");
	var discardChangesButton = document.getElementById("discardChangesButton");
	var updatePasswordButton = document.getElementById("updatePassword");
	var closeButton = document.getElementById("closeButtonUpdateProfile");

	formInputs.forEach((elm) => {
		if (elm != input)
			elm.disabled = true;
	});
	discardChangesButton.classList.remove("d-none");
	updatePasswordButton.classList.add("d-none");
	closeButton.classList.add("d-none");

}


function getSubmittedInput() {
	var formInputs = document.querySelectorAll(".formInputs");
	var inputsArray = Array.from(formInputs);
	return inputsArray.find((input) => !input.hasAttribute("disabled"));
}

function toggleModal(modalName) {
	if (modalName) {
		var modalDiv= document.getElementById(modalName);
		var modal = bootstrap.Modal.getInstance(modalDiv);
		if (modal instanceof bootstrap.Modal)
			modal.toggle();
		else {
			modal = new bootstrap.Modal(modalDiv);
			modal.toggle();
		}
	}
}


export {
	enableDisableSaveButtonOnInput,
	disableSaveChangesButton,
	getSubmittedInput,
	resetForm,
	toggleModal,
	inputInitListeners,
};
