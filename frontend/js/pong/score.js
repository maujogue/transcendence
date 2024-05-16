import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { removeObject } from './removeObject.js';
import { createTexturedMaterial, load3DTextures } from './loadTextures.js';

async function loadFont() {
	return new Promise((resolve, reject) => {
	  const loader = new FontLoader();
	  loader.load('assets/fonts/Digital-7_Regular.json', (font) => {
		resolve(font);
	  });
	});
}
  
async function createTextMesh(text, font, environment, name) {
	const geometry = new TextGeometry(text, {
	  font: font,
	  size: .5,
	  depth: 0.1
	});
	const material = new THREE.MeshPhysicalMaterial({ 
		color : 0xffffff,
		roughness : 0.3,
		metalness: 0.8
	 });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.rotateX(Math.PI / -6);
	mesh.name = name;
	mesh.scale.set(8, 6, 6);
	return (mesh);
}

async function actualizeScore(player1, player2, environment, font) {
    removeObject("scorePlayer1", environment);
	removeObject("scorePlayer2", environment);

    const scoreP1 = await createTextMesh(player1.score + '', font, environment, "scorePlayer1");
	const scoreP2 = await createTextMesh(player2.score + '', font, environment, "scorePlayer2");
    scoreP1.position.set(-5, -1.5, -18.1);
	scoreP2.position.set(3, -1.5, -18.1);
	environment.scene.add(scoreP1);
	environment.scene.add(scoreP2);
}

export { createTextMesh, loadFont, actualizeScore };