import { isLoggedIn, toggleContentOnLogState } from "./Utils.js";
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
	new Page("Dashboard", "/", "html/Dashboard.html", true),
	new Page("Dashboard", "/dash", "html/Dashboard.html", true),
	new Page("Sidebar", "", "html/Sidebar.html", true),
	new Page("About", "/about", "html/About.html"),
	new Page("Game", "/game", "html/Game.html", true),
	new Page("EmailVerified", "/emailVerified", "html/EmailVerified.html"),
];

window.addEventListener("popstate", () => router(routes));

document.addEventListener("DOMContentLoaded", async () => {
	document.body.addEventListener("click", (e) => navigateOnClick(e));
	await initArray(routes);
	await initGame();
	await initSidebar();
	router(routes);
});

async function router() {
	await injectPageHtml();
	await injectModule();
	await injectPageJs();
	toggleContentOnLogState();
	await injectUserData();
	toggleActiveTab(location.pathname);
};

function navigateTo(url) {
	if (url !== location.pathname) {
		history.pushState({}, null, url);
		router(routes);
	}
	toggleActiveTab(location.pathname);
	injectUserData();
	toggleContentOnLogState();
}

function navigateOnClick(e) {
	let target = e.target;
	while (target && target.parentNode !== document.body && !target.getAttribute("href"))
		target = target.parentNode;
	if (target && target.matches("[navlink]")) {
		e.preventDefault();
		navigateTo(target.getAttribute("href"));
	}
}

function getCurrentPage() {
	let page = routes.find((page) => page.urlPath === location.pathname);
	if (!page) {
		page = routes[0];
		history.pushState({}, "", "/");
	}
	return page;
}

async function injectPageHtml() {
	const mainPageDiv = document.getElementById("content");
	var page = getCurrentPage();
	if (page && page.name == "Game") {
		mainPageDiv.innerHTML = "";
		document.getElementById("game").removeAttribute('hidden');
	}
	else if (page && page.html) {
		mainPageDiv.innerHTML = page.html;
		document.getElementById("game").setAttribute('hidden', '');
	}
}

async function injectPageJs() {
	var page = getCurrentPage();
	if (page && page.init)
		page.init();
}

async function initSidebar() {
	const sidebarDiv = document.getElementById("sidebar-container");
	let sidebar = routes.find((elm) => elm.name === "Sidebar");
	sidebarDiv.innerHTML = sidebar.html;
	sidebar.init();
}

async function initGame() {
	let game = routes.find((elm) => elm.name === "Game");
	document.getElementById("game").innerHTML = game.html;
	await game.init();
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

export { navigateTo };
