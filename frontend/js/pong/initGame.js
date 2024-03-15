import { createBall } from './createBall.js';
import { createEnvironment, createMap } from './createEnvironment.js';
import { loadFont, actualizeScore } from './score.js';
import { colors } from './varGlobal.js';
import * as THREE from 'three';

function setLight(posX, env, player) {
	const color = colors.get(player.character.name);
	let light = new THREE.PointLight(color, 100);

	light.position.set(posX, 0, 0.9).unproject(env.camera);
	player.light = light;
	env.scene.add(player.light);
}

function setPositionPaddle(PlayerName, posX, environment, player) {
	let paddle = environment.scene.getObjectByName("paddle_" + PlayerName);
	paddle.position.set(posX, 0, 0.9).unproject(environment.camera);
	paddle.rotation.set(0, 0, 0);
	paddle.scale.set(1, 1, 1);
	setLight(posX, environment, player);
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
	const map = await createMap(environment);

	let dirLight = new THREE.DirectionalLight(0xffffff, .1);
	dirLight.position.set(0, 0, 1);
	environment.scene.add(dirLight);
	environment.scene.add(player1.paddle.mesh);
	environment.scene.add(player2.paddle.mesh);
	setPositionPaddle("player1", -0.8, environment, player1);
	setPositionPaddle("player2", 0.8, environment, player2);
	removeSelectMenu();
	let ball = createBall(environment);
	environment.scene.add(ball.mesh);
	const font = await loadFont();
	actualizeScore(player1, player2, environment, font);
	return { 
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