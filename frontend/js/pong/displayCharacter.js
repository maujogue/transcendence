import * as THREE from 'three';
import { createPlayer } from "./createPlayer.js";
import { clock } from './main.js';
import { colors, lobbyCharPos, lobbyPaddlePos } from './varGlobal.js';

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
	const newColor = new THREE.Color(color); 
	const object = environment.scene.getObjectByName("paddle_" + name);
	object.material.color.set(newColor);
	player.paddle.mesh = object;
	player.light.color.set(newColor);
	const lightLobby = environment.scene.getObjectByName("lobbyLight");
	if (lightLobby)
		lightLobby.color.set(newColor);
	environment.scene.add(object);
	return (player);
}

async function changeCharacter(player, environment, character, name) {
	if (!character)
		return ;
	await removeObject(name, environment);
	const x = setPosXByPlayerName(name, lobbyCharPos);
	player.setCharacter(environment, character);
	player.character.setCharacterInLobby(name, environment);
	changeColor(colors.get(character), environment, player, name);
	return (player);
}

async function displayCharacter(player ,environment, character, name) {
	let rotate = setPosXByPlayerName(name, 2.5);
	let posX = setPosXByPlayerName(name, lobbyPaddlePos);

	if (environment.scene.getObjectByName(name))
		return (changeCharacter(player, environment, character, name));
	player = await createPlayer(posX, 0, 0.7, character, environment, name);
	player.character.setCharacterInLobby(name, environment, posX);
	player.paddle.mesh.rotation.set(0, rotate, 0);
	player.paddle.mesh.scale.set(1, 1, 1);
	environment.scene.add(player.paddle.mesh);
	return (player);
}

function updateMixers(player1, player2) {
	const delta = clock.getDelta();

	player1?.character.mixer?.update(delta);
	player2?.character.mixer?.update(delta);
}

export { displayCharacter, updateMixers };