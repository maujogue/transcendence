import { injectElementTranslations, injectTranslations } from "../modules/translationsModule/translationsModule.js";
import { isLoggedIn } from "../Utils.js";


export async function init(queryParams) {
	var redirectButon = document.getElementById('redirectButton');
	if (await isLoggedIn())
		redirectButon.innerHTML = '<button href="/dash" class="btn btn-success"><span data-lang="go_dash"> Go to dashboard</span></button>';
	else
		redirectButon.innerHTML = '<button data-bs-toggle="modal" data-bs-target="#login" class="btn btn-success"><span data-lang="go_login_page">Go to login page</span></button>';
	injectElementTranslations("#emailVerified");
}