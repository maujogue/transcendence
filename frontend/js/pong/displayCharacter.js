import * as THREE from 'three';
import { createPlayer } from "./createPlayer.js";

function changeColor(color, environment, player, name) {
	let object = environment.scene.getObjectByName(name);
	let x = -0.8;

	if (name == 'player2')
		x = 0.8;
	environment.scene.remove(object);
	environment.scene.remove(player.light);
	object.material.color.set(new THREE.Color(color));
	player.paddle.mesh = object;
	player.light.color = new THREE.Color(color);
	environment.scene.add(object);
	environment.scene.add(player.light);
	environment.renderer.render(environment.scene, environment.camera);
	return (player);
}

// Load a glTF resource

async function displayCharacter(player ,environment, color, name) {
	let rotate = 2.5;
	let posX = -0.6;

	if (name == "player2") {
		rotate = -2.5;
		posX = 0.6;
	}
	if (environment.scene.getObjectByName(name))
		return (changeColor(color, environment, player, name));
	player = await createPlayer(posX, 0.15, 0.9, color, environment, name);
	player.character.setCharacterInLobby(environment, posX);
	player.paddle.mesh.material.color.set(new THREE.Color(color));
	player.paddle.mesh.rotation.set(0, rotate, 0);
	player.paddle.mesh.scale.set(2, 2, 2);
	player.light.color = new THREE.Color(color);
	environment.scene.add(player.paddle.mesh);
	environment.scene.add(player.light);
	environment.renderer.render(environment.scene, environment.camera);
	return (player);
}

export { displayCharacter };