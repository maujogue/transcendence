import { createBall } from './createBall.js';
import { createEnvironment, createMap } from './createEnvironment.js';
import { loadFont, actualizeScore } from './score.js';
import { colors } from './varGlobal.js';
import * as THREE from 'three';

function setPointLight(env, player, pos1, pos2) {
	const color = colors.get(player.name);
	const botLight = new THREE.PointLight(color, 1000);
	const topLight = new THREE.PointLight(color, 1000);

	botLight.position.set(pos1).unproject(env.camera);
	topLight.position.set(pos2).unproject(env.camera);
	env.scene.add(botLight);
	env.scene.add(topLight);
	//env.scene.add(helper);
	return (light);
}

function setPlayersLights(player1, player2, environment) {
	console.log("Name : ", player1.name);
	player1.light = setPointLight(environment, player1, (-.9, -.15, .82), (-.9, .15, .82));
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

	environment.scene.add(player1.paddle.mesh);
	environment.scene.add(player2.paddle.mesh);
	let spotlight = setPlayersLights(environment, player1.character, player2.character);
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