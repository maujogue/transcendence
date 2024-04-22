import { updateProfile } from "./ApiCalls.js";
import { getUserData } from "./User.js";
import { togglePasswordVisibility } from "./Utils.js";

export default async function onLoad() {

  //submit form and update userData
  var updateProfileForm = document.getElementById("updateProfileForm");
  updateProfileForm.addEventListener("submit", async (event) => {
    updateProfile(event, updateProfileForm);
	document.getElementById("confirmPasswordPassword").value = "";
	document.getElementById("saveChangesButton").classList.add("disabled");
	setTimeout(async () => {
		userData = await getUserData();
	  }, 1000);
  });

  //Password visibility on password Confirm
  togglePasswordVisibility("confirmPasswordToggle", "confirmPasswordPassword");


  //disable "save changes button" if form has no changes
  var userData = await getUserData();
  var formInputs = document.querySelectorAll(".formInputs");
  var saveChangesButton = document.getElementById("saveChangesButton");
  formInputs.forEach((input) => {
    input.addEventListener("input", async (event) => {
      // console.log(input.value, userData, input.name, userData[input.name]);
      if (input.value !== userData[input.name])
        saveChangesButton.classList.remove("disabled");
      else saveChangesButton.classList.add("disabled");
    });
  });
}
