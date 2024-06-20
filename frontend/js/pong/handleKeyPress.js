import { movePaddle } from "./movePaddle.js";
import { displayCharacter } from "./displayCharacter.js";
import { soloMode, model } from "../pages/game.js";
import { moveCursor } from "./menu.js";
import { performAction, predictAction } from "./AI/AIUtils.js";
import * as THREE from 'three';

async function handleMenuKeyPress(keysPressed, player1, player2, env) {
	if (keysPressed["d"]) {
		await moveCursor("d", player1, "cursorP1", env);
		keysPressed["d"] = false;
	}
	else if (keysPressed["a"]) {
		await moveCursor("q", player1, "cursorP1", env);
		keysPressed["a"] = false;
	}
	if (keysPressed["ArrowRight"]) {
		await moveCursor("ArrowRight", player2, "cursorP2", env);
		keysPressed["ArrowRight"] = false;
	}
	else if (keysPressed["ArrowLeft"]) {
		await moveCursor("ArrowLeft", player2, "cursorP2", env);
		keysPressed["ArrowLeft"] = false;
	}
}

function handleKeyPress(keysPressed, player1, player2, environment) {
	let playerBox1;
	let playerBox2;
	
	if (!player1)
		return;
	playerBox1 = new THREE.Box3().setFromObject(player1.paddle.mesh);
	if (keysPressed["w"] && !environment.border.up.box.intersectsBox(playerBox1)) {
		player1.paddle.mesh.translateY(0.15);
		player1.light.position.y += 0.15;
	}
	if (keysPressed["s"] && !environment.border.down.box.intersectsBox(playerBox1)) {
		player1.paddle.mesh.translateY(-0.15);
		player1.light.position.y -= 0.15;
	}

	if (!player2)
		return;
	if (soloMode) {
		var predictions = predictAction(player1, player2, environment, model);
		const maxValue = Math.max(...predictions);
		const action = predictions.indexOf(maxValue);
		console.log("Action: ", action);
		performAction(action, player2, environment); // AI action
		return;
	}
	playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (keysPressed["ArrowUp"] && !environment.border.up.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(0.15);
		player2.light.position.y += 0.15;
	}
	if (keysPressed["ArrowDown"] && !environment.border.down.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(-0.15);
		player2.light.position.y -= 0.15;
	}
}

export { handleKeyPress, handleMenuKeyPress};