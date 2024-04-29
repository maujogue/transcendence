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
];

async function injectModule(name, div) {
	var module = modules.find((elm) => elm.name === name);
	var html = await module.fetchHtml();
	setInnerHtml(div, html);
}

export { injectModule };