import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js"

export async function init() {
	var module = getModuleDiv("auth42");
	if (!module)
		return ;

	var authButton = module.querySelector(".authButton");
	authButton.addEventListener("click", (e) => {
		e.preventDefault();
		window.location.href = "/api/auth42/login_with_42/";
	})
}