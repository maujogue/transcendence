import en from '../../../translations/en.json' with { type: 'json' };
import es from '../../../translations/es.json' with { type: 'json' };
import fr from '../../../translations/fr.json' with { type: 'json' };
import { getModuleDiv } from "../../Modules.js";
import { runEndPoint } from "../../ApiUtils.js";
import { getUserData } from "../../User.js";
import { initPages } from '../../Router.js';
import { isLoggedIn, showAlert } from '../../Utils.js';

export async function init() {
	var module = getModuleDiv("translationsModule");
	if (!module)
		return;

	initLanguageSwitcher();
	initDropdownListeners();
	injectTranslations();

	async function initLanguageSwitcher() {
		var button = module.querySelector('.languageSwitcher');

		var lang = await getUserData("lang");
		if (!lang) {
			lang = Cookies.get("lang");
			if (!lang) {
				lang = navigator.language || navigator.userLanguage;
				Cookies.set("lang", lang.slice(0, 2));
			}
		}
		else
			Cookies.set("lang", lang.slice(0, 2));
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
				else
					Cookies.set("lang", lang);
				initPages();
			});
		});
	}

	async function injectTranslations() {
		var json = getJsonFromLang();
		const elmDivs = document.querySelectorAll("[data-lang]");
		elmDivs.forEach((elm) => {
			const key = elm.getAttribute("data-lang");
			if (json[key])
				elm.innerHTML = json[key];
		});
	}
}

function getJsonFromLang() {
	var lang = Cookies.get("lang");
	switch (lang) {
		case "es":
			return es;
		case "fr":
			return fr;
		default:
			return en;
	}
}

async function setLanguage(userLanguage) {
	const response = await runEndPoint("users/update_lang/", "POST", JSON.stringify({ lang: userLanguage }));
}

async function injectGameTranslations() {
	var json = getJsonFromLang();

	const elmDivs = document.querySelectorAll("#game [data-lang]");
	elmDivs.forEach((elm) => {
		const key = elm.getAttribute("data-lang");
		if (json[key])
			elm.innerHTML = json[key];
	});
}

function printQueryParamsMessage(queryParams) {
	if (queryParams) {
		var message = queryParams.get("message");
		var success = queryParams.get("success");
		var json = getJsonFromLang();
		if (message)
			showAlert(json[message], success);
		console.log(message, success, json, json[message]);
	}
	history.replaceState(null, null, window.location.pathname);
}

export { setLanguage, injectGameTranslations, printQueryParamsMessage }