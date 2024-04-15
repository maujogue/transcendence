import {updateProfile} from "./ApiCalls.js"

var updateProfileForm = document.getElementById("updateProfileForm");
updateProfileForm.addEventListener("submit", (event) => updateProfile(event));