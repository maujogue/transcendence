class Module {
	constructor(name) {
		this.name = name;
		this.init = null;
		this.html = null;
		this.filePath = "js/modules/" + name + "/" + name + ".html";
	}
	async fetchHtml() {
		this.html = await fetch(this.filePath).then((x) => x.text());
	}
	async fetchInit() {
		this.init = await importFunction("./modules/" + this.name + "/", this.name, true);
	}
}

const modules = [
	new Module("usernameInputModule"),
	new Module("emailInputModule"),
	new Module("friendList"),
	new Module("statisticsModule"),
	new Module("auth42"),

	new Module("translationsModule"), //leave it last so that it injects all modules before it
];

async function initArray(array) {
	await Promise.all(array.map(module => module.fetchInit()));
	await Promise.all(array.map(module => module.fetchHtml()));
}

async function injectModule(div) {
    const regex = /^[ \n\t]*$/;
    await initArray(modules);

    for (const moduleType of modules) {
		if (div) {
			div = document.querySelector("." + div);
        	var moduleDivs = div.querySelectorAll("." + moduleType.name);
		}
		else
			var moduleDivs = document.querySelectorAll("." + moduleType.name);
        for (const div of moduleDivs) {
            if (regex.test(div.innerHTML)) {
                div.innerHTML = moduleType.html;
                await moduleType.init();
            }
        }
    }
}

async function updateModule(moduleName) {
	const module = modules.find(module => module.name === moduleName);
	if (module) {
		const moduleDivs = document.querySelectorAll("." + moduleName);
		for (const div of moduleDivs) {
			div.removeAttribute("id");
			div.innerHTML = module.html;
			await module.init();
		}
	}
}

async function importFunction(modulePath, moduleName, run) {
	if (modulePath && moduleName && run) {
		try {
			const module = await import(`${modulePath}${moduleName}.js`);
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

export { initArray, injectModule, getModuleDiv, importFunction, updateModule};