import { recreateCanvas } from "./createEnvironment.js";
import { initSpaceBackground, stopStep } from "./spaceBackground.js";
import { winWidth, winHeight } from "./gameModule.js";

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

function resizeSpaceBackground() {
	if (!stopStep())
		return;
	recreateCanvas("canvas");
	initSpaceBackground();
}

function resizeImages() {
	if (document.getElementById("spriteStart")) {
		if (isFullScreen()) {
			document.getElementById("spriteStart").style.backgroundImage = "url('assets/img/sprite/StartSheet.png')";
		} else {
			document.getElementById("spriteStart").style.backgroundImage = "url('assets/img/sprite/StartSheetSmall.png')";
		}
	}
	if (document.getElementsByClassName("sprite")[0]) {
		const spriteP1 = document.getElementById("spriteP1");
		const spriteP2 = document.getElementById("spriteP2");
		if (isFullScreen()) {
			spriteP1.style.backgroundImage = "url('assets/img/sprite/P1SheetFullScreen.png')";
			if (spriteP2)
				spriteP2.style.backgroundImage = "url('assets/img/sprite/P2SheetFullScreen.png')";
		} else {
			spriteP1.style.backgroundImage = "url('assets/img/sprite/P1SheetSmall.png')";
			if (spriteP2)
				spriteP2.style.backgroundImage = "url('assets/img/sprite/P2SheetSmall.png')";
		}
	}
}

function resizeGame(environment) {
	environment.camera.updateProjectionMatrix();
	environment.renderer.setSize(width, height);
	environment.renderer.render(environment.scene, environment.camera);
}

function resize(environment) {
	console.log("resize: ", width, height);
	setSize();
	resizeSpaceBackground();
	const div = document.getElementsByClassName("menu")[0];
	if (div) {
		console.log("resize menu");
		div.style.width = width + "px";
		div.style.height = height + "px";
		div.style.fontSize = width / 25 + "px";
	}
	if (!environment)
		return ;
	resizeImages();
	resizeGame(environment);
}

export {resize, isFullScreen }