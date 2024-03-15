class Page {
	constructor (name, urlPath, filePath) {
		this.name = name;
		this.urlPath = urlPath;
        this.filePath = filePath
		document.title = name;
	}
    async fetchHtml() {
        return await fetch(this.filePath).then(x => x.text());
    }
}

const routes = [
	new Page("LandingPage", "/", "html/LandingPage.html"),
	new Page("Game", "/game", "html/Game.html"),
];

const mainPageDiv = "#page";

function setInnerHtml(elm, html) {
	elm.innerHTML = html;
	Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
		const newScript = document.createElement("script");
		Array.from(oldScript.attributes)
		.forEach(attr => newScript.setAttribute(attr.name, attr.value));
		newScript.appendChild(document.createTextNode(oldScript.innerHTML));
		oldScript.parentNode.replaceChild(newScript, oldScript);
	});
  }

function navigateTo (url) {

    if (url === location.pathname) {
        history.replaceState(null, null, url);
    } else {
        history.pushState(null, null, url);
    }
    router(routes, mainPageDiv);
}


const router = async (routes, divToInsertHtml) => {
	const potentialMatches = routes.map(route => {
		return {
			route: route,
			isMatch: location.pathname === route.urlPath
		};
	});
	let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
	if (!match){
		match = {
			route: routes[0],
			isMatch: true
		};
	}
	const page = match.route;
	let app = document.querySelector(divToInsertHtml);
	const html = await page.fetchHtml();
	setInnerHtml(app, html);
};


window.addEventListener("popstate", event => router(routes, mainPageDiv));

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		if (e.getElementById == "imageNav" || e.target.matches("[navlink]")){
			e.preventDefault();
			navigateTo(e.target.getAttribute('href'));
		}
	});
	router(routes, mainPageDiv);
});
