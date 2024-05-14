import * as THREE from 'three';
import { createField, createBorder } from './createField.js';
import { winWidth, winHeight } from './varGlobal.js';
import { isFullScreen } from './resize.js';
import { loadScene } from './loadModels.js';

const map = await loadScene('maps/map1/map1');

function getSize() {
	var width = winWidth;
	var height = winHeight;
	
	if (isFullScreen()) {
		width = window.screen.width;
		height = window.screen.height;
	}
	return {
		"width": width,
		"height": height
	};
}

function createMap(env) {
	const model = map.scene;
	const light = new THREE.AmbientLight(0xffffff, 1);

	env.camera.position.set(0, 13, 10);
	env.camera.lookAt(0, 0, 0);
	model.scale.set(.45, .45, .45);
    model.rotateY(Math.PI / 2);
    model.position.set(2.2, -.3, 0);
	env.scene.add(model);
	env.scene.add(light);

	const topSide = map.scene.getObjectByName("topSide");
	const botSide = map.scene.getObjectByName("bottomSide");
	var topSidePosition = new THREE.Vector3();
	var botSidePosition = new THREE.Vector3();

	topSide.getWorldPosition(topSidePosition);
	botSide.getWorldPosition(botSidePosition);

	const borderDown = createBorder(topSidePosition, env);
	const borderUp = createBorder(botSidePosition, env);
	return {
		"borderUp": borderUp,
		"borderDown": borderDown
	};
}

function createEnvironment(id) {
	const div = document.getElementById(id);
	const divSize = getSize();
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	const camera = new THREE.PerspectiveCamera( 45, divSize.width / divSize.height, 1, 100);
	camera.position.set(0, 0, -2);

	const renderer = new THREE.WebGLRenderer({ canvas: div, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(divSize.width, divSize.height);

	return {
		"scene": scene,
		"renderer": renderer,
		"camera": camera
	  };
}

function ClearAllEnv(environment) {
    if (!environment)
        return;

    while (environment.scene.children.length > 0) {
        const obj = environment.scene.children[0];
        environment.scene.remove(obj);

        if (obj instanceof THREE.Object3D) {
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    if (material.map)
                        material.map.dispose();
                }
            });
        }
    }
    environment.renderer.dispose();
}

export { createEnvironment, createMap, getSize, ClearAllEnv};