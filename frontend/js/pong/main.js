import { resize, isFullScreen } from "./resize.js";
import { checkCollision } from "./collision.js";
import { displayMainMenu, createSelectMenu, displayLobby } from './menu.js';
import { handleKeyPress, handleMenuKeyPress } from './handleKeyPress.js';
import { displayCharacter } from './displayCharacter.js';
import { initGame } from "./initGame.js";
import { createEndScreen, returnToMenu } from "./createEndScreen.js"
import { actualizeScore } from "./score.js";
import { createField } from "./createField.js";
import { connectToLobby } from "./online.js";
import { ClearAllEnv } from "./createEnvironment.js";
import { import3DModel } from "./displayCharacter.js";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let start = false;
let divMenu = document.getElementById("menu");
let environment;
let player1;
let player2;
let keyPress = false;
let keysPressed = {};
let isOnline = false;
const field = await createField();
const gameDiv = document.getElementById('game');
let mixer;
let clock = new THREE.Clock();
const idle = undefined;

displayMainMenu();

const loader = new GLTFLoader();

// Load a glTF resource
function loadModel() {
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
			mixer = new THREE.AnimationMixer(mesh);
			mixer.clipAction(gltf.animations[1]).play();
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

async function goToLocalSelectMenu() {
	divMenu = document.getElementById("menu");
	divMenu.remove();
	environment = createSelectMenu(field);
	player1 = await displayCharacter(player1, environment, "rgb(255, 0, 0)", "player1");
	player2 = await displayCharacter(player2, environment, "rgb(0, 0, 255)", "player2");
	loadModel();
}

document.addEventListener("keydown", function(event) {
	keysPressed[event.key] = true;
	if (keysPressed['A'])
		keysPressed['a'] = true;
	if (keysPressed['D'])
		keysPressed['d'] = true;
	if (keysPressed['W'])
		keysPressed['w'] = true;
	if (keysPressed['S'])
		keysPressed['s'] = true;
	keyPress = true;
	event.stopPropagation();
});

document.addEventListener("keyup", function(event) {
	delete keysPressed[event.key];
});


document.addEventListener('click', function (event) {
	if (!gameDiv.contains(event.target)) {
		document.body.style.overflow = 'auto';
	}
});

gameDiv.addEventListener('click', function () {
	document.body.style.overflow = 'hidden';
});

document.body.addEventListener("click", function(event) {
	if (event.target.id == 'restart' && !isOnline) {
		document.getElementById("endscreen").remove();
		actualizeScore(player1, player2, environment, environment.font);
		start = true;
	}
	if (event.target.id == 'backMenu') {
		ClearAllEnv(environment);
		returnToMenu();
	}
	if (event.target.id == 'localGame') {
		localGameLoop();
		goToLocalSelectMenu();
	}
	if (event.target.id == 'onlineGame') {
		isOnline = true;
		connectToLobby(field);
	}
	if (event.target.id == 'fullScreen') {
		if (!isFullScreen())
			gameDiv.requestFullscreen();
		else
			document.exitFullscreen();
	}
});

document.addEventListener('fullscreenchange', function() {
	resize(environment);
});

function setIfGameIsEnd() {
	if (player1.score < 1 && player2.score < 1)
		return ;
	let winner = player1.name;
	if (player2.score > player1.score)
		winner = player2.name;
	createEndScreen(winner);
	start = false;
	player1.score = 0;
	player2.score = 0;
}

async function localGameLoop() {
	var delta = clock.getDelta();
	if (keyPress && !start)
		await handleMenuKeyPress(keysPressed, player1, player2, environment);
	if (keysPressed[" "] && document.getElementById("selectMenu") && player1 && player2 && !start) {
		start = true;
		ClearAllEnv(environment);
		divMenu.remove();
		environment = await initGame(player1, player2);
	}
	if (start) {
		if (keyPress)
		handleKeyPress(keysPressed, player1, player2, environment);
	checkCollision(environment.ball, player1, player2, environment);
	setIfGameIsEnd();
}
mixer?.update(delta);
	environment?.renderer.render( environment.scene, environment.camera );
	requestAnimationFrame( localGameLoop );
}

export { displayMainMenu }