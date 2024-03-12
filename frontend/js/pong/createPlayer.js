import * as THREE from 'three';
import { Player } from "./Class/Player.js";
import { Paddle } from './Class/Paddle.js';
import { colors } from './varGlobal.js';

function createPointLight(left, top, color, mesh, environment) {
	console.log("light:", color);
	var light = new THREE.PointLight(color, 20, 0, 1.2);
	
	light.castShadow = true;
	light.position.set(left, top, 0 ).unproject(environment.camera);
	light.target = mesh;
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
			createPointLight(left, top, color, depth, environment),
			environment.characters.get(character).clone()
	));
}

export { createPlayer, createPaddle };