import {updateProfile} from "./ApiCalls.js"
import { getUserData } from "./User.js";
import { togglePasswordVisibility } from "./Utils.js";

var updateProfileForm = document.getElementById("updateProfileForm");

updateProfileForm.addEventListener("submit", (event) => {
	updateProfile(event, updateProfileForm)
});

togglePasswordVisibility("confirmPasswordToggle", "confirmPasswordPassword");

var updateProfileModal = document.getElementById("updateProfileModal");

updateProfileModal.addEventListener("hidden.bs.modal", (event) => {
	document.getElementById("saveChangesButton").classList.add("disabled");
});

var formInputs = document.querySelectorAll(".formInputs");
var userData = await getUserData();
formInputs.forEach((input) => {
	input.addEventListener("input", (event) => {
		console.log(input.value, userData, input.name, userData[input.name]);
		if (!(input.value === userData[input.name]))
			document.getElementById("saveChangesButton").classList.remove("disabled");
		else
			document.getElementById("saveChangesButton").classList.add("disabled");
	});
})
console.log(formInputs);