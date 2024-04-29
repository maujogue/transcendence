import { getUserData } from "../User.js";
import { checkInputAvailable } from "../ApiCalls.js";

var userData = await getUserData();
var module = document.querySelector(".usernameInputModule");
var input = module.querySelector(".usernameInput");

input.addEventListener("input", () => checkUsername(input, userData));

async function checkUsername(input, userData) {
	if (input.value !== userData[input.name]) {
		invalidateUsernameIfUnavailable(input, userData[input.name]);
	}
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
			if (input.value == userInput)
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
	}, 300);
}