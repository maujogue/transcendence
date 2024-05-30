import { isLoggedIn, toggleContentOnLogState, resetModalFormsInitListeners } from "./Utils.js";
import { injectUserData } from "./User.js";
import { injectModule, initArray, importFunction } from "./Modules.js";

class Page {
	constructor(name, urlPath, filePath, importJs) {
		this.name = name;
		this.urlPath = urlPath;
		this.filePath = filePath;
		this.importJs = importJs;
		this.init = null;
		this.html = null;
	}
	async fetchHtml() {
		this.html = await fetch(this.filePath).then((x) => x.text());
	}
	async fetchInit() {
		this.init = await importFunction("./pages/", this.name, this.importJs);
	}
}

const routes = [
	new Page("Dashboard", "/dash", "html/Dashboard.html", true),
	new Page("Sidebar", "", "html/Sidebar.html", true),
	new Page("About", "/about", "html/About.html"),
	new Page("Game", "/game", "html/Game.html", true),
	new Page("EmailVerified", "/emailVerified", "html/EmailVerified.html", true),
];

window.addEventListener("popstate", () => router(routes));

document.addEventListener("DOMContentLoaded", async () => {
	document.body.addEventListener("click", async (e) => await navigateOnClick(e));
	await initArray(routes);
	await initPages();
	router(routes);
	resetModalFormsInitListeners();
});

async function router() {
	var allPages = Array.from(document.querySelectorAll(".page"));
	let newPage = routes.find((page) => page.urlPath === location.pathname);
	if (!newPage) {
		newPage = routes[0];
		history.pushState({}, '', newPage.urlPath);
	}
	var previousPage = allPages.find((x) => x.hidden == false);
	if (previousPage)
		previousPage.hidden = true;
	var newPageDiv = allPages.find(page => page.id === newPage.name);
	toggleContentOnLogState();
	toggleActiveTab(location.pathname);
	if (newPageDiv)
		newPageDiv.hidden = false;
};

async function navigateTo(url) {
	if (url !== location.pathname) {
		history.pushState({}, null, url);
		router();
	}
}

async function navigateOnClick(e) {
	let target = e.target;
	while (target && target.parentNode !== document.body && !target.getAttribute("href"))
		target = target.parentNode;
	if (target && target.matches("[navlink]")) {
		e.preventDefault();
		await navigateTo(target.getAttribute("href"));
	}
}

function toggleActiveTab(target) {
	var currentActive = document.querySelector(".active");
	if (currentActive != null)
		currentActive.classList.remove("active");
	if (target == "/")
		target = "/dash";
	if (target == "/dash" || target == "/game" || (target == "/about" && !isLoggedIn()))
		document.querySelector("a[href='" + target + "']").classList.add("active");
}

async function initPages() {
	var contentContainer = document.getElementById("content-container");
	let queryParams = new URLSearchParams(location.search);
	routes.forEach(async page => {
		if (page.name === "Sidebar")
			document.getElementById("sidebar-container").innerHTML = page.html;
		else {
			contentContainer.innerHTML += `<div id="${page.name}" class="page" hidden></div>`;
			contentContainer.querySelector(`#${page.name}`).innerHTML = page.html;
		}
		if (page.init) {
			if (page.urlPath === location.pathname)
				await page.init(queryParams);
			else
				await page.init();
		}
	});
	toggleContentOnLogState();
	await injectUserData();
	toggleActiveTab(location.pathname);
}

export { navigateTo };
