import { winWidth, winHeight } from "./varGlobal.js";

function isFullScreen() {
	return (document.fullscreenElement);
}

let width = winWidth;
let height = winHeight;

function setSize() {
	if (isFullScreen()) {
		width = window.screen.width;
		height = window.screen.height;
	} else {
		width = winWidth;
		height = winHeight;
	}
}

function resize(environment) {
	setSize();
	const div = document.getElementsByClassName("menu")[0];
	if (div) {
		div.style.width = width + "px";
		div.style.height = height + "px";
		div.style.fontSize = width / 25 + "px";
	}
	if (!environment)
		return ;
	environment.camera.updateProjectionMatrix();
	environment.renderer.setSize(width, height);
	environment.renderer.render(environment.scene, environment.camera);
}

export {resize, isFullScreen }