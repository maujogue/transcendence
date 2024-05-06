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
		this.init = await importFunction("./", this.name, this.importJs);
	}
}

const routes = [
	new Page("Dashboard", "/", "html/Dashboard.html", true),
	new Page("Dashboard", "/dash", "html/Dashboard.html", true),
	new Page("Sidebar", "", "html/Sidebar.html", true),
	new Page("About", "/about", "html/About.html"),
	new Page("Game", "/game", "html/Game.html"),
];

window.addEventListener("popstate", () => router(routes));

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (e) => navigateOnClick(e));
	router(routes);
});

async function router() {
	await initArray(routes);
	await initSidebar();
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
	toggleContentOnLogState();
	injectUserData();
	toggleActiveTab(url);
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
	const mainPageDiv = document.getElementById("content-container");
	var page = getCurrentPage();
	if (page && page.html)
		mainPageDiv.innerHTML = page.html;
}

async function injectPageJs() {
	var page = getCurrentPage();
	if (page && page.init)
		page.init();
}

async function initSidebar() {
	if (!document.getElementById("sidebar")){
		const sidebarDiv = document.getElementById("sidebar-container");
		let sidebar = routes.find((elm) => elm.name === "Sidebar");
		sidebarDiv.innerHTML = sidebar.html;
		sidebar.init();
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

function setInnerHtml(elm, html) {
	elm.innerHTML = html;
	routes.from(elm.querySelectorAll("script")).forEach((oldScript) => {
		const newScript = document.createElement("script");
		Array.from(oldScript.attributes).forEach((attr) =>
			newScript.setAttribute(attr.name, attr.value)
		);
		newScript.appendChild(document.createTextNode(oldScript.innerHTML));
		oldScript.parentNode.replaceChild(newScript, oldScript);
	});
}

export { navigateTo, setInnerHtml };
