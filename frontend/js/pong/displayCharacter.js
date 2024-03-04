import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

async function import3DModel(environment) {
	const loader = new GLTFLoader();
	const model = {
		idle : null,
		mesh : null,
		mixer : null,
	}
	
	// Load a glTF resource
	loader.load('assets/models/char.glb',
	async function ( gltf ) {
			gltf.animations; // Array<THREE.AnimationClip>
			gltf.scene; // THREE.Group
			gltf.scenes; // Array<THREE.Group>
			gltf.cameras; // Array<THREE.Camera>
			gltf.asset; // Object

			// await environment.renderer.compileAsync( gltf.scene, environment.camera, environment.scene );
			const mesh = gltf.scene.children[0];
			mesh.position.set(0, -0.50, 0).unproject(environment.camera);
			mesh.scale.set(0.005, 0.005, 0.005);
			environment.scene.add(mesh);
			environment.renderer.render(environment.scene, environment.camera);
			model.idle = gltf.animations[0];
			model.mesh = mesh;
			model.mixer = new THREE.AnimationMixer(model.mesh);
		},
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			
			console.log( 'An error happened', error );
			
		}
		);
}

async function displayCharacter(player ,environment, color, name) {
	console.log('displayCharacter');
	let rotate = 2.5;
	let posX = -0.6;

	if (name == "player2") {
		rotate = -2.5;
		posX = 0.6;
	}
	if (environment.scene.getObjectByName(name))
		return (changeColor(color, environment, player, name));
	player = await createPlayer(posX, 0.15, 0.9, color, environment, name);
	player.paddle.mesh.material.color.set(new THREE.Color(color));
	player.paddle.mesh.rotation.set(0, rotate, 0);
	player.paddle.mesh.scale.set(2, 2, 2);
	player.light.color = new THREE.Color(color);
	environment.scene.add(player.paddle.mesh);
	environment.scene.add(player.light);
	environment.renderer.render(environment.scene, environment.camera);
	return (player);
}

export { displayCharacter, import3DModel };