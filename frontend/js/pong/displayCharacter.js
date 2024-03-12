import * as THREE from 'three';
import { createPlayer } from "./createPlayer.js";
import { clock } from './main.js';

async function removeObject(name, environment) {
	let object = environment.scene.getObjectByName(name);
	if (object)
		environment.scene.remove(object);
	else
		console.warn(`Object with name ${name} not found in the scene.`);
}

function setPosX(name) {
	if (name == 'player2')
		return (0.8);
	return (-0.8)
}

async function changeCharacter(player, environment, character, name) {
	await removeObject(name, environment);
	const x = setPosX(name);
	player.setCharacter(environment, character);
	player.character.setCharacterInLobby(name, environment, x);
	console.log(environment.scene);
	return (player);
}

async function displayCharacter(player ,environment, character, name) {
	let rotate = 2.5;
	let posX = -0.6;
	const color = 'rgb(255,255,255)';

	if (name == "player2") {
		rotate = -2.5;
		posX = 0.6;
	}
	if (environment.scene.getObjectByName(name))
		return (changeCharacter(player, environment, character, name));
	player = await createPlayer(posX, 0.15, 0.9, character, environment, name);
	player.character.setCharacterInLobby(name, environment, posX);
	player.paddle.mesh.material.color.set(new THREE.Color(color));
	player.paddle.mesh.rotation.set(0, rotate, 0);
	player.paddle.mesh.scale.set(2, 2, 2);
	player.light.color = new THREE.Color(color);
	environment.scene.add(player.paddle.mesh);
	environment.scene.add(player.light);
	return (player);
}

function updateMixers(player1, player2) {
	const delta = clock.getDelta();

	player1.character.mixer?.update(delta);
	player2.character.mixer?.update(delta);
}

export { displayCharacter, updateMixers };