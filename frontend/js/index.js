import Dashboard from "./views/Dashboard.js";
import Posts from "./views/Posts.js";
import Settings from "./views/Settings.js";
import Game from "./views/Game.js";

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

const navigateTo = url => {
	history.pushState(null, null, url);
	router();
}

const router = async () => {
	const routes = [
		{ path: "/", view: Dashboard },
		{ path: "/posts", view: Posts },
		{ path: "/settings", view: Settings},
		{ path: "/game", view: Game}
	];

	const potentialMatches = routes.map(route => {
		return {
			route: route,
			isMatch: location.pathname === route.path
		};
	});

	let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
	
	if (!match){
		match = {
			route: routes[0],
			isMatch: true
		};
	}

	const view = new match.route.view();
	let app = document.querySelector("#app");
	let html = await view.getHtml();
	// document.querySelector("#app").innerHTML = await view.getHtml();
	setInnerHtml(app, html);
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		if (e.target.matches("[data-link]")){
			e.preventDefault();
			navigateTo(e.target.href);
		}
	});
	router();
});