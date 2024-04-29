class Module {
	constructor(name, filePath) {
		this.name = name;
		thisl.filePath = filePath;
	}
	async fetchHtml() {
		return await fetch(this.filePath).then((x) => x.text());
	}
}

const modules = [
	new Module("usernameInput", "js/modules/usernameInput"),
];
