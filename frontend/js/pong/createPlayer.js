import * as THREE from 'three';
import { Player } from "./Class/Player.js";
import { Paddle } from './Class/Paddle.js';
import { createTexturedMaterial } from './loadTextures.js';

function createPointLight(left, top, color, mesh, environment) {
	var light = new THREE.PointLight(color, 20, 0, 1.2);
	
	light.castShadow = true;
	light.position.set(left, top, 0 ).unproject(environment.camera);
	light.target = mesh;
	environment.scene.add(light);
	return (light);
}


async function createPaddle(left, top, depth, color, environment) {
	const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 1);
	const material = new THREE.MeshPhongMaterial({ color: color });
	const mesh = new THREE.Mesh( paddleGeometry, material);
	
	mesh.position.set(left, top, depth).unproject(environment.camera);
	mesh.rotation.set(0, 0, 0);
	mesh.updateMatrix();
	environment.camera.updateProjectionMatrix();
	return (new Paddle(mesh));
}

async function createPlayer(left, top, depth, color, environment, name) {
	const paddle = await createPaddle(left, top, depth, color, environment);
	paddle.mesh.name = name;
	return (
		new Player(
			name,
			paddle,
			createPointLight(left, top, color, depth, environment),
			environment.characters.get('chupacabra').clone()
	));
}

export { createPlayer, createPaddle };