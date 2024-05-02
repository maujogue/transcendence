import { setInnerHtml } from "./Router.js";

class Module {
	constructor(name, filePath) {
		this.name = name;
		this.filePath = filePath;
	}
	async fetchHtml() {
		return await fetch(this.filePath).then((x) => x.text());
	}
}

const modules = [
	new Module("usernameInput", "js/modules/usernameInput.html"),
	new Module("emailInput", "js/modules/emailInput.html"),
];

async function injectModule(moduleName, parentDivName) {
	var parentDiv = document.getElementById(parentDivName);
	var div = parentDiv.querySelector("." + moduleName + "Module");
	var module = modules.find((elm) => elm.name === moduleName);
	if (module) {
		var html = await module.fetchHtml();
		setInnerHtml(div, html);
	}
}	

function generateUniqueId(moduleName) {
	var iterator = 1;
	while (document.getElementById(moduleName + "Module_" + iterator) != null)
		iterator++;
	const moduleId = moduleName + "Module_" + iterator;
	return moduleId;
}

function getModuleDiv(moduleName) {
	var modules = document.querySelectorAll("." + moduleName + "Module");
	for (const module of modules)
	{
		if (!module.hasAttribute("id"))
		{
			module.id = generateUniqueId(moduleName);
			return (module);
		}
	}
	return null
}

export { injectModule, getModuleDiv};