import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
	constructor () {
		super();
		this.setTitle("Dashboard");
	}

	async getHtml () {
		return `
			<!-- <link rel="stylesheet" href="/css/pong.css">
			<div id="game">
				<canvas id="canvas"></canvas>
			</div>
			<body>
				<script type="module" src="/js/pong/main.js"></script>
				<script src="https://kit.fontawesome.com/f7996aafde.js" crossorigin="anonymous"></script>
			</body> -->
		`;
}
}
