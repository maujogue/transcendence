import * as THREE from 'three';
import { createPlayer } from "./createPlayer.js";
import { clock } from './main.js';
import { colors } from './varGlobal.js';

async function removeObject(name, environment) {
	let object = environment.scene.getObjectByName(name);
	if (object)
		environment.scene.remove(object);
	else
		console.warn(`Object with name ${name} not found in the scene.`);
}

function setPosXByPlayerName(name, x) {
	if (name == 'player2')
		return (x * -1);
	return (x)
}

function changeColor(color, environment, player, name) {
	const object = environment.scene.getObjectByName("paddle_" + name);
	object.material.color.set(new THREE.Color(color));
	player.paddle.mesh = object;
	player.light.color = new THREE.Color(color);
	environment.scene.add(object);
	environment.scene.add(player.light);
	environment.renderer.render(environment.scene, environment.camera);
	return (player);
}

async function changeCharacter(player, environment, character, name) {
	await removeObject(name, environment);
	const x = setPosXByPlayerName(name, -0.8);
	player.setCharacter(environment, character);
	player.character.setCharacterInLobby(name, environment, x);
	changeColor(colors.get(character), environment, player, name);
	return (player);
}

async function displayCharacter(player ,environment, character, name) {
	let rotate = setPosXByPlayerName(name, 2.5);
	let posX = setPosXByPlayerName(name, -0.6);

	if (environment.scene.getObjectByName(name))
		return (changeCharacter(player, environment, character, name));
	player = await createPlayer(posX, 0.15, 0.9, character, environment, name);
	player.character.setCharacterInLobby(name, environment, posX);
	player.paddle.mesh.rotation.set(0, rotate, 0);
	player.paddle.mesh.scale.set(2, 2, 2);
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