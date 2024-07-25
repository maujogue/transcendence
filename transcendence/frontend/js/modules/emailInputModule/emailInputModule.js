import { getUserData } from "../../User.js";
import { checkInputAvailable } from "../../ApiCalls.js";
import { disableSaveChangesButton, resetForm } from "../../DashboardUtils.js";
import { getModuleDiv } from "../../Modules.js";
import { getKeyTranslation } from "../translationsModule/translationsModule.js";
let debounceTimer;

export async function init() {
	var module = getModuleDiv("emailInputModule");
	if (!module)
		return;

	var userData = await getUserData();
	var input = module.querySelector(".emailInput");

	input.addEventListener("input", () => {
		checkEmail(input, userData);
	});
}

async function checkEmail(input, userData) {
	if (userData && input.value !== userData[input.name]) {
		await invalidateEmailIfUnavailable(input, userData[input.name]);
	}
	else if (!userData)
		await invalidateEmailIfUnavailable(input);
}

async function invalidateEmailIfUnavailable(input, userInput) {
	const inputFeedback = input.parentNode.querySelector('.emailInput ~ div');
	clearTimeout(debounceTimer);
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	debounceTimer = setTimeout(async () => {
		if (!emailPattern.test(input.value)) {
			inputFeedback.innerHTML = await getKeyTranslation("email_invalid");
			input.classList.remove("is-valid");
			input.classList.add("is-invalid");
		} else {
			var emailAvailable = await checkInputAvailable(input.value, "email");
			if (userInput && input.value == userInput)
				resetForm();
			else if (!emailAvailable) {
				inputFeedback.innerHTML = await getKeyTranslation("email_unavailable");
				input.classList.remove("is-valid");
				input.classList.add("is-invalid");
			} else {
				input.classList.remove("is-invalid");
				input.classList.add("is-valid");
			}
		}
		disableSaveChangesButton(input);
	}, 300);
}

export async function initListenersEmail() {
	var userData = await getUserData();
	var inputs = document.querySelectorAll(".emailInput");

	inputs.forEach((input) => {
		input.addEventListener("input", () => {
			checkEmail(input, userData);
		});
	});
}