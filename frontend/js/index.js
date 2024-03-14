import Homepage from "./views/Homepage.js";
import Posts from "./views/Posts.js";
import Settings from "./views/Settings.js";
import Game from "./views/Game.js";

function showDiv(div) {
	if (div == "dashboard")
	{
		document.getElementById("dashboard").style.display = "block"
		document.getElementById("game").style.display = "none"
	}
	else if (div == "both")
	{
		document.getElementById("game").style.display = "block";
		document.getElementById("dashboard").style.display = "block";
	}
	else if (div == "game")
	{
		document.getElementById("game").style.display = "block"
		document.getElementById("dashboard").style.display = "none"
	}
}


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
	router(routes, "#app");
}

const routes = [
	{ path: "/", view: Homepage },
	{ path: "/posts", view: Posts },
	{ path: "/settings", view: Settings },
	{ path: "/both"},
	{ path: "/game"},
	{ path: "/dashboard"}
];

const router = async (routes, divToInsertHtml) => {


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
	console.log(match.route.path);
	if (match.route.path == "/dashboard") {
		showDiv("dashboard")
		return ;
	}
	else if (match.route.path == "/game") {
		showDiv("game")
		return ;
	}
	else if (match.route.path == "/both") {
		showDiv("both")
		return ;
	}
	const view = new match.route.view();
	let app = document.querySelector(divToInsertHtml);
	let html = await view.getHtml();
	setInnerHtml(app, html);
};


window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		if (e.getElementById == "imageNav" || e.target.matches("[data-link]")){
			e.preventDefault();
			navigateTo(e.target.href);
			console.log(e.target.href);
		}
	});
	router(routes, "#app");
});

(() => {
	'use strict'
	const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	tooltipTriggerList.forEach(tooltipTriggerEl => {
	  new bootstrap.Tooltip(tooltipTriggerEl)
	})
  })()
  