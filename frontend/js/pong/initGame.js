import { createBall } from './createBall.js';
import { createEnvironment, createMap } from './createEnvironment.js';
import { loadFont, actualizeScore } from './score.js';
import { colors } from './varGlobal.js';
import * as THREE from 'three';

function setPointLight(env, player, posTop, posBot) {
	const color = colors.get(player.name);
	const botLight = new THREE.PointLight(color, 100);
	const topLight = new THREE.PointLight(color, 100);
	const helperTop = new THREE.PointLightHelper(topLight, 1);
	const helperBot = new THREE.PointLightHelper(botLight, 1);

	env.scene.add(helperBot);
	env.scene.add(helperTop);
	botLight.position.copy(posBot).unproject(env.camera);
	topLight.position.copy(posTop).unproject(env.camera);
	env.scene.add(botLight);
	env.scene.add(topLight);
	return {botLight, topLight};
}

function setPlayersLights(player1, player2, environment) {
	console.log("Name : ", player1.name);
	let posBot = new THREE.Vector3(-.5, -.1, .9);
	let posTop = new THREE.Vector3(-.75, 1.2, .9);
	player1.lights = setPointLight(environment, player1, posTop, posBot);
	posBot = new THREE.Vector3(.75, 0, .82);
	posTop = new THREE.Vector3(.75, 1.2, .9);
	player2.lights = setPointLight(environment, player2, posTop, posBot);
}

function setPositionPaddle(PlayerName, posX, environment) {
	let paddle = environment.scene.getObjectByName("paddle_" + PlayerName);
	paddle.rotation.set(0, 0, 0);
	paddle.rotateX(Math.PI / -6);
	paddle.position.set(posX, 0, .89).unproject(environment.camera);
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
	const map = createMap(environment);

	environment.scene.add(player1.paddle.mesh);
	environment.scene.add(player2.paddle.mesh);
	let spotlight = setPlayersLights(player1.character, player2.character, environment);
	setPositionPaddle("player1", -.57, environment, player1);
	setPositionPaddle("player2", .57, environment, player2);
	removeSelectMenu();
	let ball = createBall(environment);
	environment.scene.add(ball.mesh);
	const font = await loadFont();
	actualizeScore(player1, player2, environment, font);
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