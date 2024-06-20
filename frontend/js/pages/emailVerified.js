import { isLoggedIn } from "../Utils.js";


export async function init(queryParams) {
	var redirectButon = document.getElementById('redirectButton');
	if (await isLoggedIn())
		redirectButon.innerHTML = '<a href="/dash" class="btn btn-success" navlink>Go to Dashboard Page</a>';
	else
		redirectButon.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#login" class="btn btn-success" navlink>Go to Login Page</a>';
}