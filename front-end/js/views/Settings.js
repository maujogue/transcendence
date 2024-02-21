import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor () {
		super();
		this.setTitle("Posts");
	}

	async getHtml () {
		return `
			<h1>Settings</h1>
			<p>
				Modify your user settings.
			</p>

		`;
	}

	async getJs() {
		return "console.log('Settings');";
	}
}
