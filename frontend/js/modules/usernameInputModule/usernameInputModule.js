import { getUserData } from "../../User.js";
import { checkInputAvailable } from "../../ApiCalls.js";
import { disableSaveChangesButton, resetForm } from "../../DashboardUtils.js";
import { getModuleDiv } from "../../Modules.js";
let debounceTimer;

export async function init() {
	var module = getModuleDiv("usernameInputModule");
	if (!module)
		return;

	var userData = await getUserData();
	var input = module.querySelector(".usernameInput");

	input.addEventListener("input", () => {
		checkUsername(input, userData);
	});
}

async function checkUsername(input, userData) {
	if (userData && input.value !== userData[input.name]) {
		await invalidateUsernameIfUnavailable(input, userData[input.name]);
	}
	else if (!userData)
		await invalidateUsernameIfUnavailable(input);
}

async function invalidateUsernameIfUnavailable(input, userInput) {
	const inputFeedback = input.parentNode.querySelector('.usernameInput ~ div');
	clearTimeout(debounceTimer);

	debounceTimer = setTimeout(async () => {
		if (input.value.length < 3) {
			inputFeedback.innerHTML = "Username must be at least 3 characters long";
			input.classList.remove("is-valid");
			input.classList.add("is-invalid");
		} else {
			var usernameAvailable = await checkInputAvailable(input.value, "username");
			if (userInput && input.value == userInput)
				resetForm();
			else if (!usernameAvailable) {
				inputFeedback.innerHTML = "Username is not Available!";
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

export async function initListenersUsername() {
	var userData = await getUserData();
	var inputs = document.querySelectorAll(".usernameInput");

	inputs.forEach((input) => {
		input.addEventListener("input", () => {
			checkUsername(input, userData);
		});
	});
}