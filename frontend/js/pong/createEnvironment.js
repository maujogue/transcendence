import * as THREE from 'three';
import { createField, createBorder } from './createField.js';
import { winWidth, winHeight } from './varGlobal.js';
import { isFullScreen } from './resize.js';
import { loadScene } from './loadModels.js';

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

async function createMap(env) {
	const map = await loadScene('maps/map1/map1');
	const model = map.scene;
    //const mesh = model.children[0];
	const light = new THREE.AmbientLight(0xffffff, .5);

	model.scale.set(.45, .45, .45);
    model.rotateX(Math.PI / 3);
    model.rotateY(Math.PI / 2);
    model.position.set(.15, 0, .92).unproject(env.camera);
	env.scene.add(model);
	env.scene.add(light);
	env.renderer.render(env.scene, env.camera);
	// let borderUp = await createBorder(new THREE.Vector3(0, 1.075, 0.9), environment.camera);
	// let borderDown = await createBorder(new THREE.Vector3(0, -1.075, 0.9), environment.camera);
	// let borderCenter = await createBorder(new THREE.Vector3(0, 0, 0.95), environment.camera);
	// borderCenter.mesh.material.metalness = 0.2;
	// borderCenter.mesh.material.roughness = 0.8;
	// borderCenter.mesh.rotation.set(0, 0, Math.PI / 2);
	// borderCenter.mesh.scale.set(1, 0.3, 1);
	// environment.scene.add(borderDown.mesh);
	// environment.scene.add(borderUp.mesh);
	// environment.scene.add(borderCenter.mesh);
	// environment.scene.add(await createField());
	return {
		"borderUp": 0,
		"borderDown": 0
	};
}

function createEnvironment(id) {
	const div = document.getElementById(id);
	const divSize = getSize();
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	const camera = new THREE.PerspectiveCamera( 45, divSize.width / divSize.height, 1, 100);

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