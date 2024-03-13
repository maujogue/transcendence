import { createBall } from './createBall.js';
import { createEnvironment, createMap } from './createEnvironment.js';
import { loadFont, actualizeScore } from './score.js';

function setPositionPaddle(PlayerName, posX, environment) {
	let paddle = environment.scene.getObjectByName("paddle_" + PlayerName);
	paddle.position.set(posX, 0, 0.9).unproject(environment.camera);
	paddle.rotation.set(0, 0, 0);
	paddle.scale.set(1, 1, 1);
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

	environment.scene.add(player1.paddle.mesh);
	environment.scene.add(player2.paddle.mesh);
	environment.scene.add(player1.light);
	environment.scene.add(player2.light);
	setPositionPaddle("player1", -0.8, environment);
	setPositionPaddle("player2", 0.8, environment);
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