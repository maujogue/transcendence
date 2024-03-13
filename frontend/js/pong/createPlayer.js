import * as THREE from 'three';
import { Player } from "./Class/Player.js";
import { Paddle } from './Class/Paddle.js';
import { colors } from './varGlobal.js';

function createSpotLight(left, top, color, mesh, environment) {
	var light = new THREE.SpotLight(color, 500);
	
	console.log(left);
	if (left < 0)
		light.position.set(left - .2, .85, .9).unproject(environment.camera);
	else
		light.position.set(left + .2, .85, .9).unproject(environment.camera);
	environment.scene.add(light);
	return (light);
}


async function createPaddle(left, top, depth, color, environment) {
	console.log(color);
	const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 1);
	const material = new THREE.MeshPhongMaterial({ color: color });
	const mesh = new THREE.Mesh( paddleGeometry, material);
	
	mesh.position.set(left, top, depth).unproject(environment.camera);
	mesh.rotation.set(0, 0, 0);
	mesh.updateMatrix();
	environment.camera.updateProjectionMatrix();
	return (new Paddle(mesh));
}

async function createPlayer(left, top, depth, character, environment, name) {
	const color = colors.get(character);
	if (!color)
		color = "rgb(255, 255, 255)";

	const paddle = await createPaddle(left, top, depth, color, environment);
	paddle.mesh.name = "paddle_" + name;
	return (
		new Player(
			name,
			paddle,
			createSpotLight(left, top, color, depth, environment),
			environment.characters.get(character).clone()
	));
}

export { createPlayer, createPaddle };