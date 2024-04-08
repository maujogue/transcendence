class Page {
  constructor(name, urlPath, filePath, sidebar) {
    this.name = name;
    this.urlPath = urlPath;
    this.filePath = filePath;
    this.sidebar = sidebar;
    document.title = name;
  }
  async fetchHtml() {
    return await fetch(this.filePath).then((x) => x.text());
  }
}

const routes = [
  new Page("Sidebar", "", "html/Sidebar.html", false),

  new Page("LandingPage", "/", "html/LandingPage.html", false),
  new Page("LandingPage", "/LandingPage", "html/LandingPage.html", false),

  new Page("Game", "/game", "html/Game.html", true),
  new Page("Dashboard", "/dashboard", "html/Dashboard.html", true),
  new Page("Stats", "/stats", "html/Stats.html", true),
  new Page("Profile", "/profile", "html/Profile.html", true),
  new Page("Settings", "/settings", "html/Settings.html", true),
];

const mainPageDiv = "#content-container";
const sidebarDiv = "#sidebar-container";
let previousPage = null;

function setInnerHtml(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach((oldScript) => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach((attr) =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

function navigateTo(url) {
  if (url !== location.pathname) {
    history.pushState(null, null, url);
    router(routes, mainPageDiv);
  }
}

const router = async (routes, divToInsertHtml) => {
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      isMatch: location.pathname === route.urlPath,
    };
  });
  let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);
  if (!match) {
    match = {
      route: routes[0],
      isMatch: true,
    };
  }
  const page = match.route;
  const html = await page.fetchHtml();
  console.log(previousPage);
  setInnerHtml(document.querySelector(mainPageDiv), html);
  if (
    page.sidebar == true &&
    (previousPage == null || previousPage.sidebar == false)
  ) {
    setInnerHtml(document.querySelector(sidebarDiv), "");
    console.log("sidebar ");
    let sidebarHtml = await routes
      .find((elm) => elm.name === "Sidebar")
      .fetchHtml();
    setInnerHtml(document.querySelector(sidebarDiv), sidebarHtml);
  }
  if (page.sidebar == false)
    setInnerHtml(document.querySelector(sidebarDiv), "");

  previousPage = page;
};

window.addEventListener("popstate", (event) => router(routes, mainPageDiv));

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    let target = e.target;
    console.log(target);
    while (
      target &&
      target.parentNode !== document.body &&
      !target.getAttribute("href")
    ) {
      target = target.parentNode;
    }
    if (target && target.matches("[navlink]")) {
      e.preventDefault();
      console.log("prevented");
      navigateTo(target.getAttribute("href"));
    }
  });
  router(routes, mainPageDiv);
});
