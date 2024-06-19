import { updateModule } from "./Modules.js";
import { injectUserData, getUserData } from "./User.js";

function inputInitListeners() {
	var modal = document.getElementById("updateProfileModal");
	var formInputs = modal.querySelectorAll(".formInputs");
	formInputs.forEach((input) => {
		var inputClone = input.cloneNode(true);
		input.parentNode.replaceChild(inputClone, input);
		inputClone.addEventListener("input", enableDisableSaveButtonOnInput);
	});
}

async function enableDisableSaveButtonOnInput(input) {
	var userData = await getUserData();
	input = input.target;
	console.log(input.value, userData[input.name]);
	if (userData && input.value !== userData[input.name]) {
		disableFormInputs(input);
		disableSaveChangesButton(input);
	} else {
		resetForm(input);
	}
}

function resetForm(input) {
	var formInputs = document.querySelectorAll(".formInputs");
	var saveChangesButton = document.querySelector(".saveChangesButton");
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
	});
	discardChangesButton.classList.add("d-none");
	updatePasswordButton.classList.remove("d-none");
	saveChangesButton.classList.add("disabled");
	closeButton.classList.remove("d-none");

}

function disableSaveChangesButton(input) {
	var modal = input.closest(".modal");
	var saveChangesButton = modal.querySelector(".saveChangesButton");
	if (saveChangesButton) {
		if (!input.classList.contains("is-invalid"))
			saveChangesButton.classList.remove("disabled");
		else
			saveChangesButton.classList.add("disabled");
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

async function displayUserPage(username) {
	var userDash = document.getElementById("userDash");
	userDash.style.transition = "opacity 0.5s";
	userDash.style.opacity = 0;

	setTimeout(() => {
		userDash.querySelector("#closeProfileBtn").innerHTML = `
		<button id='closeUserDash' class='btn btn-warning mb-3 top-0 end-100 d-flex align-items-center justify-content-center'>
			<i class="pt-1 fa-solid fa-arrow-left text-white h4"></i>
			<span class="pt-1 ms-2 text-white h4"> Back</span>
		</button>
		`;
		var closeBtn = userDash.querySelector("#closeUserDash");
		closeBtn.addEventListener("click", async () => {
			userDash.style.opacity = 0;
			await showUserDash(null, closeBtn);
		});
	}, 500);
	showUserDash(username);
}

async function showUserDash(username, closeBtn) {
	setTimeout(async () => {
		if (closeBtn)
			closeBtn.remove();
		await injectUserData(userDash, username);
		await updateModule("statisticsModule")
		setTimeout(() => {
			userDash.style.opacity = 1;
		}, 200);
	}, 500);
}

export {
	enableDisableSaveButtonOnInput,
	disableSaveChangesButton,
	getSubmittedInput,
	resetForm,
	toggleConfirmPasswordModal,
	inputInitListeners,
	displayUserPage
};
