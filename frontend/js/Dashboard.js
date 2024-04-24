import { updateProfile, updatePassword } from "./ApiCalls.js";
import { getUserData } from "./User.js";
import { togglePasswordVisibility, checkPassword, isLoggedIn} from "./Utils.js";
	
  //submit update profile form and update userData
  var updateProfileForm = document.getElementById("updateProfileForm");
  updateProfileForm.addEventListener("submit", async (event) => {
	event.preventDefault();
    updateProfile(updateProfileForm);
	document.getElementById("confirmPasswordPassword").value = "";
	document.getElementById("saveChangesButton").classList.add("disabled");
	setTimeout(async () => {
		userData = await getUserData();	
	  }, 1000);
  });

  //submit update password form
  var updatePasswordForm = document.getElementById("updatePasswordForm");
  updatePasswordForm.addEventListener("submit", async (event) => {
	event.preventDefault();
    updatePassword(updatePasswordForm);
	document.getElementById("updatePasswordCurrentPassword").value = "";
	document.getElementById("updatePasswordFirstPassword").value = "";
	document.getElementById("updatePasswordSecondPassword").value = "";
  });

  //check new password on register input
	var password1 = document.getElementById("updatePasswordFirstPassword");
	var password2 = document.getElementById("updatePasswordSecondPassword");

	password1.addEventListener("input", (event) => checkPassword("update", password1, password2));
	password2.addEventListener("input", (event) => checkPassword("update", password1, password2));

  //Password visibility on password Confirm
  togglePasswordVisibility("confirmPasswordToggle", "confirmPasswordPassword");
  togglePasswordVisibility("updatePasswordCurrentPasswordToggle", "updatePasswordCurrentPassword");
  togglePasswordVisibility("updatePasswordFirstPasswordToggle", "updatePasswordFirstPassword");
  togglePasswordVisibility("updatePasswordSecondPasswordToggle", "updatePasswordSecondPassword");


  //disable "save changes button" if form has no changes
		var userData = await getUserData();
		var formInputs = document.querySelectorAll(".formInputs");
		var saveChangesButton = document.getElementById("saveChangesButton");
		formInputs.forEach((input) => {
			input.addEventListener("input", async (event) => {
				if (input.value !== userData[input.name])
				saveChangesButton.classList.remove("disabled");
			else saveChangesButton.classList.add("disabled");
		});
		});
