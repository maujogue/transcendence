import en from '../../../translations/en.json' with { type: 'json' };
import es from '../../../translations/es.json' with { type: 'json' };
import fr from '../../../translations/fr.json' with { type: 'json' };
import { getModuleDiv } from "../../Modules.js";
import { runEndPoint } from "../../ApiUtils.js";
import { getUserData } from "../../User.js";
import { initPages } from '../../Router.js';


export async function init() {
	var module = getModuleDiv("translationsModule");
	if (!module)
		return;

	injectTranslations();
	initLanguageSwitcher();

	function initLanguageSwitcher() {
		var flags = module.querySelectorAll('.dropdown-item');
		flags.forEach(flag => {
			flag.addEventListener('click', async event => {
				const lang = event.currentTarget.getAttribute('data-lang');
				const flag = event.currentTarget.querySelector('.flag-icon').src;
				const name = event.currentTarget.textContent.trim();
				
				const button = module.querySelector('.languageSwitcher');
				button.querySelector("img").src = flag;
				button.querySelector(".section-name").textContent = name;
				await setLanguage(lang);
				initPages();
			});
		});
		
	}

	async function setLanguage(userLanguage) {
		const response = await runEndPoint("users/update_lang/", "POST", JSON.stringify({ lang: userLanguage }));
		// console.log(response);
	}

	async function initLanguage() {
		const userLanguage = navigator.language || navigator.userLanguage;
		userLanguage = userLanguage.slice(0, 2);
		setLanguage(userLanguage);
	}
	async function injectTranslations() {

		var lang = await getUserData("lang");
		console.log(lang);
		switch (lang) {
			case "es":
				lang = es;
				break;
			case "fr":
				lang = fr;
				break;
			default:
				lang = en;
		}
		const elmDivs = document.querySelectorAll("[data-lang]");
		elmDivs.forEach((elm) => {
			const key = elm.getAttribute("data-lang");
			if (lang[key])
				elm.innerHTML = lang[key];
		});
	}
}
