import { getModuleDiv } from "../../Modules.js";
import { runEndPoint } from "../../ApiUtils.js";
import { getUserData } from "../../User.js";
import { initPages } from '../../Router.js';
import { disableCollapsedSidebar, isLoggedIn, showAlert } from '../../Utils.js';

export async function init() {
	var module = getModuleDiv("translationsModule");
	if (!module)
		return;

	await initLanguageSwitcher();
	await initDropdownListeners();
	injectTranslations();

	async function initLanguageSwitcher() {
		var button = module.querySelector('.languageSwitcher');

		var lang = await getUserData("lang");
		if (!lang) {
			lang = Cookies.get("lang");
			if (!lang) {
				lang = navigator.language || navigator.userLanguage;
				lang = lang.slice(0, 2);
				Cookies.set("lang", lang);
			}
		}
		else
			Cookies.set("lang", lang);
		var flag = module.querySelector(`[data-lang="${lang}"] > img`).src;
		var name = module.querySelector(`[data-lang="${lang}"] > span`).textContent.trim();
		button.querySelector("img").src = flag;
		button.querySelector(".section-name").textContent = name;
	}

	async function initDropdownListeners() {
		var button = module.querySelector('.languageSwitcher');
		var flags = module.querySelectorAll('.dropdown-item');

		flags.forEach(flag => {
			flag.addEventListener('click', async event => {
				const lang = event.currentTarget.getAttribute('data-lang');
				const flag = event.currentTarget.querySelector('.flag-icon').src;
				const name = event.currentTarget.textContent.trim();

				button.querySelector("img").src = flag;
				button.querySelector(".section-name").textContent = name;
				if (await isLoggedIn())
					await setLanguage(lang);
				Cookies.set("lang", lang);
				await disableCollapsedSidebar(true);
				injectTranslations();
			});
		});
	}
}

async function injectTranslations() {
	var json = await getJsonFromLang();
	if (!json)
		return ;
	const elmDivs = document.querySelectorAll("[data-lang]");
	elmDivs.forEach((elm) => {
		const key = elm.getAttribute("data-lang");
		if (json[key]) {
			if (elm.placeholder)
				elm.placeholder = json[key];
			else
				elm.innerHTML = json[key];
		}
	});
}

async function getJsonFromLang() {
	var lang = Cookies.get("lang");
	if (!lang)
		return ;
	try {
		return await fetch(`../../../../translations/${lang}.json`).then((res) => res.json()).then((data) => { return data });
	}
	catch (e) {
		console.error(`Error loading ${lang}.json file`);
		return null;
	}
}

async function setLanguage(userLanguage) {
	await runEndPoint("users/update_lang/", "POST", JSON.stringify({ lang: userLanguage }));
}

async function injectElementTranslations(elementSelector) {
	var json = await getJsonFromLang();
	if (!json)
		return ;
	var el = document.querySelector(elementSelector);
	const elmDivs = el.querySelectorAll("[data-lang]");
	elmDivs.forEach((elm) => {
		const key = elm.getAttribute("data-lang");
		if (json[key])
			elm.innerHTML = json[key];
	});
}

async function getKeyTranslation(key) {
	var json = await getJsonFromLang();

	if (json && json[key])
		return json[key];
	return key;
}

async function printQueryParamsMessage(queryParams) {
	if (queryParams) {
		var message = queryParams.get("message");
		var success = queryParams.get("success");
		var json = await getJsonFromLang();
		if (!json)
			return ;
		if (message)
			showAlert(json[message], success);
	}
	history.replaceState(null, null, window.location.pathname);
}

export { setLanguage, injectElementTranslations, printQueryParamsMessage, injectTranslations, getKeyTranslation}