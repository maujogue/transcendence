import { getUserData } from "../User.js";
import { checkInputAvailable } from "../ApiCalls.js";
import { disableSaveChangesButton, resetForm } from "../DashboardUtils.js";
import { getModuleDiv } from "../Modules.js";

async function init() {
	var module = getModuleDiv("usernameInputModule");

	var userData = await getUserData();
	var input = module.querySelector(".usernameInput");

	input.addEventListener("input", () => {
		checkUsername(input, userData);
	});

	async function checkUsername(input, userData) {
		if (userData && input.value !== userData[input.name]) {
			await invalidateUsernameIfUnavailable(input, userData[input.name]);
		}
		else if (!userData)
			await invalidateUsernameIfUnavailable(input);
	}

	let debounceTimer;

	async function invalidateUsernameIfUnavailable(input, userInput) {
		const inputFeedback = module.querySelector('.usernameInput ~ div');
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
}

export { init };