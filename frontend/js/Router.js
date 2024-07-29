import { isLoggedIn, toggleContentOnLogState, resetModalFormsInitListeners, disableCollapsedSidebar } from "./Utils.js";
import { injectUserData } from "./User.js";
import { initArray, importFunction, injectModule, updateModule } from "./Modules.js";

export const hostname = window && window.location && window.location.hostname; 

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
	new Page("dashboard", "/dash", "html/Dashboard.html", true),
	new Page("sidebar", "", "html/Sidebar.html", true),
	new Page("emailVerified", "/emailVerified", "html/EmailVerified.html", true),
	new Page("about", "/about", "html/About.html", false),
	new Page("serviceDown", "/serviceDown", "html/ServiceDown.html", false),
];

window.addEventListener("popstate", () => router(routes));

document.addEventListener("DOMContentLoaded", async () => {
	document.body.addEventListener("click", async (e) => await navigateOnClick(e));
	await initArray(routes);
	await initPages();
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
	toggleActiveTab(location.pathname);
	var newPageDiv = allPages.find(page => page.id === newPage.name);
	if (newPageDiv)
		newPageDiv.hidden = false;
};

async function navigateTo(url) {
	history.pushState({}, null, url);
	router();
}

async function navigateOnClick(e) {
	let target = e.target;
	while (target && target.parentNode !== document.body && !target.hasAttribute("href"))
		target = target.parentNode;
	if (target && target.matches("[navlink]")) {
		e.preventDefault();
		await navigateTo(target.getAttribute("href"));
	}
}

async function initPages() {
	var contentContainer = document.getElementById("content-container");
	contentContainer.innerHTML = "";
	setLoading(true);
	for (const page of routes) {
		if (page.name === "sidebar")
			document.getElementById("sidebar-container").innerHTML = page.html;
		else {
			contentContainer.innerHTML += `<div id="${page.name}" class="page" hidden></div>`;
			contentContainer.querySelector(`#${page.name}`).innerHTML = page.html;
		}
	};
	await injectModule();
	await toggleContentOnLogState();
	await injectUserData();
	for (const page of routes) {
		await execPageJavascript(page.name);
	}
	router();
	toggleActiveTab(location.pathname);
	setLoading(false);
}

async function updatePage(pageName) {
	var page = routes.find((x) => x.name === pageName);
	if (page) {
		setLoading(true);
		var pageDiv = document.getElementById(pageName);
		pageDiv.innerHTML = page.html;
		await injectModule(pageName);
		await toggleContentOnLogState();
		await injectUserData();
		await execPageJavascript(pageName);
		setLoading(false);
	}

}

function setLoading(state) {
	var allPages = Array.from(document.querySelectorAll(".page"));
	var spinner = document.getElementById("loadingScreenHolder");
	var sidebarContainer = document.getElementById("sidebar-container");
	var currentPage = allPages.find((x) => x.hidden == false);
	if (state) {
		if (currentPage)
			currentPage.hidden = true;
		spinner.innerHTML = `
		<div id="loadingScreen">
			<div class="spinner" role="status"></div>
		</div>
		`;

		sidebarContainer.hidden = true;
	} else {
		document.querySelector("#loadingScreenHolder div")?.remove();
		if (currentPage)
			currentPage.hidden = false;
		sidebarContainer.hidden = false;
	}
}

async function execPageJavascript(pageName) {
	let queryParams = new URLSearchParams(location.search);

	var page = routes.find((e) => e.name === pageName);
	if (page.init) {
		if (page.urlPath === location.pathname)
			await page.init(queryParams);
		else
			await page.init();
	}
}

function toggleActiveTab(target) {
	var currentActive = document.querySelector(".active");
	if (currentActive != null)
		currentActive.classList.remove("active");
	if (target == "/")
		target = "/dash";
	if (target == "/dash" || target == "/about")
		document.querySelector("a[href='" + target + "']").classList.add("active");
}

export { navigateTo, execPageJavascript, routes, initArray, initPages, updatePage, setLoading };
