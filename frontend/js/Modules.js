import { setInnerHtml } from "./Router.js";

class Module {
	constructor(name) {
		this.name = name;
		this.init = null;
		this.html = null;
		this.filePath = "js/modules/" + name + ".html";
	}
	async fetchHtml() {
		this.html = await fetch(this.filePath).then((x) => x.text());
	}
	async fetchInit() {
		this.init = await importFunction(this.name);
	}
}

const modules = [
	new Module("usernameInputModule"),
	new Module("emailInputModule"),
];

initModules();

async function initModules() {
    await Promise.all(modules.map(module => module.fetchInit()));
    await Promise.all(modules.map(module => module.fetchHtml()));
}

async function injectModule() {
	await initModules();
	modules.forEach((moduleType) => {
		var moduleDivs = document.querySelectorAll("." + moduleType.name);
		moduleDivs.forEach(async (div) => {
			setInnerHtml(div, moduleType.html);
			moduleType.init();
		});
	});
}

async function importFunction(moduleName) {
	try {
		const module = await import(`./modules/${moduleName}.js`);
		const func = module["init"];
		if (typeof func === 'function') {
			return func;
		} else {
			throw new Error(`Function '${functionName}' not found in module '${moduleName}'`);
		}
	} catch (error) {
		console.error('Error importing function:', error);
		throw error;
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
	var modules = document.querySelectorAll("." + moduleName);
	for (const module of modules) {
		if (!module.hasAttribute("id")) {
			module.id = generateUniqueId(moduleName);
			return (module);
		}
	}
	return null
}

export { injectModule, getModuleDiv };