import { createBall } from './createBall.js';
import { createEnvironment, createMap } from './createEnvironment.js';
import { loadFont, actualizeScore } from './score.js';
import { colors } from './varGlobal.js';
import * as THREE from 'three';

export let initialP1Pos = new THREE.Vector3(-8.5, 0, 0);
export let initialP2Pos = new THREE.Vector3(8.5, 0, 0);

function setPointLight(env, player, posTop, posBot) {
	const color = colors.get(player.name);
	const botLight = new THREE.PointLight(color, 50);
	const topLight = new THREE.PointLight(color, 50);

	botLight.position.copy(posBot);
	topLight.position.copy(posTop);
	env.scene.add(botLight);
	env.scene.add(topLight);
	return {botLight, topLight};
}

function setPlayersLights(player1, player2, environment) {
	let posBot = new THREE.Vector3(-8.5, 3, 5);
	let posTop = new THREE.Vector3(-8.5, 3, -5);
	player1.lights = setPointLight(environment, player1, posTop, posBot);
	posBot = new THREE.Vector3(8.5, 3, 5);
	posTop = new THREE.Vector3(8.5, 3, -5);
	player2.lights = setPointLight(environment, player2, posTop, posBot);
}

async function setPositionPaddle(PlayerName, posX, environment) {
	let paddle = environment.scene.getObjectByName("paddle_" + PlayerName);
	paddle.rotation.set(0, 0, 0);
	paddle.rotateX(Math.PI / 2);
	paddle.position.set(posX, 0, 0);
	paddle.scale.set(.7, .7, .7);
	environment.scene.add(paddle);
}

function removeSelectMenu() {
	let classList = document.getElementsByClassName("swatch");
	let i = 0;
	while (i < classList.length) {
		classList[i].remove();
		i++;
	}
	let div = document.getElementById("selectMenu");
	if (div)
		div.remove();
}

async function initGame(player1, player2) {
	const environment = createEnvironment("canvas");

	environment.scene.add(player1.paddle.mesh);
	environment.scene.add(player2.paddle.mesh);
	let spotlight = setPlayersLights(player1.character, player2.character, environment);
	setPositionPaddle("player1", -8.5, environment, player1);
	setPositionPaddle("player2", 8.5, environment, player2);
	removeSelectMenu();
	let ball = await createBall(environment);
	environment.scene.add(ball.mesh);
	const font = await loadFont();
	actualizeScore(player1, player2, environment, font);
	const map = await createMap(environment);

	return { 
		"spotlight": spotlight,
		"renderer": environment.renderer,
		"scene": environment.scene,
		"camera": environment.camera,
		"ball": ball,
		"font": font,
		"border" : {
			"up": map.borderUp,
			"down": map.borderDown
		}
	};
}

export { initGame }