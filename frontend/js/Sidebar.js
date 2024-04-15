import {logout} from "./ApiCalls.js"

const collapseButton = document.getElementById("collapseButton");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content-container");

collapseButton.addEventListener("click", function () {
  sidebar.classList.toggle("collapsed");
  content.classList.toggle("collapsed");
  var sectionNames = document.querySelectorAll(".section-name");
  sectionNames.forEach(function (name) {
	name.classList.toggle("section-name-collapsed");
  });
});
document.getElementById("navList").addEventListener("click", (e) => {
  let target = e.target.closest("a");
  document.querySelector("a.active").classList.remove("active");
  target.classList.add("active");
});

var logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", e => logout())