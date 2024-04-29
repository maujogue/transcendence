import { getUserData } from "../User.js";
import { checkInputAvailable } from "../ApiCalls.js";

var userData = await getUserData();
var module = document.querySelector(".emailInputModule");
var input = module.querySelector(".emailInput");

input.addEventListener("input", () => checkEmail(input, userData))

async function checkEmail(input, userData) {
	if (input.value !== userData[input.name]) {
		invalidateEmailIfUnavailable(input, userData[input.name]);
	}
}

let debounceTimer;

async function invalidateEmailIfUnavailable(input, userInput) {
	const inputFeedback = module.querySelector('.emailInput ~ div');
	clearTimeout(debounceTimer);
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	debounceTimer = setTimeout(async () => {
		if (!emailPattern.test(input.value)) {
			inputFeedback.innerHTML = "Please enter a valid email adress";
			input.classList.remove("is-valid");
			input.classList.add("is-invalid");
		} else {
			var emailAvailable = await checkInputAvailable(input.value, "email");
			if (input.value == userInput)
				resetForm();
			else if (!emailAvailable) {
				inputFeedback.innerHTML = "Email is not Available!";
				input.classList.remove("is-valid");
				input.classList.add("is-invalid");
			} else {
				input.classList.remove("is-invalid");
				input.classList.add("is-valid");
			}
		}
	}, 300);
}