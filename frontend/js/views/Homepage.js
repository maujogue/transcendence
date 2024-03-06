import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor () {
		super();
		this.setTitle("Homepage");
	}

	async getHtml () {
		return `
			<h1>Welcome back, Dom!</h1>
			<p>
				You are logged in.
			</p>
			<p>
				<a href="/posts" data-link>View recent posts</a>
			</p>
		`;
}
}