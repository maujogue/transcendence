import { movePaddle } from "./movePaddle.js";
import { displayCharacter } from "./displayCharacter.js";
import { moveCursor } from "./menu.js";
import * as THREE from 'three';
import { soloMode } from "./gameModule.js";

export let keyPress = false;
export let keysPressed = {};

export function setKeyPressToFalse() {
	keyPress = false;
}

export function clearKeysPressed() {
	keysPressed = {};
}

document.addEventListener("keydown", function (event) {
	let key = event.key;
	if (event.key?.match(/^[aqwd]$/))
		key = event.key.toLowerCase();
	keysPressed[key] = true;
	keyPress = true;
	if (event.target == document.body){
		switch(event.code){
			case "ArrowUp": case "ArrowDown":
				case "Space": event.preventDefault(); break;
				default: break;
			}
		}
	event.stopPropagation();
});

document.addEventListener("keyup", function (event) {
	delete keysPressed[event.key];
});

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
	let action = 0;

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

	if (!player2 || soloMode)
		return (-1);
	playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (keysPressed['ArrowUp'] && !environment.border.up.box.intersectsBox(playerBox2)) {
		action = 1;
		player2.paddle.mesh.translateY(0.15);
		player2.light.position.y += 0.15;
	}
	else if (keysPressed['ArrowDown'] && !environment.border.down.box.intersectsBox(playerBox2)) {
		action = 2
		player2.paddle.mesh.translateY(-0.15);
		player2.light.position.y -= 0.15;
	}

	return (action);
}

export { handleKeyPress, handleMenuKeyPress};