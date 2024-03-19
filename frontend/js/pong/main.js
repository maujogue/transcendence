import { resize, isFullScreen } from "./resize.js";
import { checkCollision } from "./collision.js";
import { displayMainMenu, createSelectMenu, displayLobby } from './menu.js';
import { handleKeyPress, handleMenuKeyPress } from './handleKeyPress.js';
import { displayCharacter, updateMixers } from './displayCharacter.js';
import { initGame } from "./initGame.js";
import { createEndScreen, returnToMenu } from "./createEndScreen.js"
import { actualizeScore } from "./score.js";
import { createField } from "./createField.js";
import { connectToLobby } from "./online.js";
import { ClearAllEnv, getSize } from "./createEnvironment.js";
import { loadAllModel } from "./loadModels.js"
import { loadScene } from "./loadModels.js";
import * as THREE from 'three';

let start = false;
let divMenu = document.getElementById("menu");
let environment;
let player1;
let player2;
let keyPress = false;
let keysPressed = {};
let isOnline = false;
const gameDiv = document.getElementById('game');
const idle = undefined;
const field = await createField();
export const lobby = await loadScene('lobbyTest');
export const clock = new THREE.Clock();
export const characters = new Map();

loadAllModel();
displayMainMenu();

async function goToLocalSelectMenu() {
	divMenu = document.getElementById("menu");
	divMenu.remove();
	environment = createSelectMenu(field, characters);
	player1 = await displayCharacter(player1, environment, "chupacabra", "player1");
	player2 = await displayCharacter(player2, environment, "elvis", "player2");
}

document.addEventListener("keydown", function(event) {
	keysPressed[event.key] = true;
	if (keysPressed['A'])
		keysPressed['a'] = true;
	if (keysPressed['D'])
		keysPressed['d'] = true;
	if (keysPressed['W'])
		keysPressed['w'] = true;
	if (keysPressed['S'])
		keysPressed['s'] = true;
	keyPress = true;
	event.stopPropagation();
});

document.addEventListener("keyup", function(event) {
	delete keysPressed[event.key];
});


document.addEventListener('click', function (event) {
	if (!gameDiv.contains(event.target)) {
		document.body.style.overflow = 'auto';
	}
});

gameDiv.addEventListener('click', function () {
	document.body.style.overflow = 'hidden';
});

document.body.addEventListener("click", function(event) {
	if (event.target.id == 'restart' && !isOnline) {
		document.getElementById("endscreen").remove();
		actualizeScore(player1, player2, environment, environment.font);
		start = true;
	}
	if (event.target.id == 'backMenu' || event.target.id == 'backIcon') {
		ClearAllEnv(environment);
		returnToMenu();
	}
	if (event.target.id == 'localGame') {
		localGameLoop();
		goToLocalSelectMenu();
	}
	if (event.target.id == 'onlineGame') {
		isOnline = true;
		connectToLobby(field);
	}
	if (event.target.id == 'fullScreen') {
		if (!isFullScreen())
			gameDiv.requestFullscreen();
		else
			document.exitFullscreen();
	}
});

document.addEventListener('fullscreenchange', function() {
	resize(environment);
});

function setIfGameIsEnd() {
	if (player1.score < 1 && player2.score < 1)
		return ;
	let winner = player1.name;
	if (player2.score > player1.score)
		winner = player2.name;
	createEndScreen(winner);
	start = false;
	player1.score = 0;
	player2.score = 0;
}

async function localGameLoop() {
	if (keyPress && !start) {
		await handleMenuKeyPress(keysPressed, player1, player2, environment);
		keyPress = false;
	}
	if (keysPressed[" "] && document.getElementById("selectMenu") && player1 && player2 && !start) {
		start = true;
		ClearAllEnv(environment);
		divMenu.remove();
		environment = await initGame(player1, player2);
	}
	if (start) {
		if (keyPress)
			handleKeyPress(keysPressed, player1, player2, environment);
		checkCollision(environment.ball, player1, player2, environment);
		setIfGameIsEnd();
	}
	if (player1 && player2)
		updateMixers(player1, player2);
	environment?.renderer.render( environment.scene, environment.camera );
	requestAnimationFrame( localGameLoop );
}

export { displayMainMenu }