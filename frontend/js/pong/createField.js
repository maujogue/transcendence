import * as THREE from 'three'
import { createTexturedMaterial } from './loadTextures.js';
import { lobby } from './main.js';

async function createBorder(position, env) {
    const geometry = new THREE.BoxGeometry(21, .1, .1);
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: .5, transparent: true } );
    const cube = new THREE.Mesh( geometry, material );

    cube.position.copy(position);
    if (position.y < 0) {
        cube.position.y += .1;
        cube.position.z -= .25;
    }
    else {
        cube.position.y -= .35;
        cube.position.z -= .1;
    }
    cube.position.x -= 3.3;
    cube.rotateX(Math.PI / 2);

    const box = new THREE.Box3().setFromObject(cube);

    env.scene.add(cube);

    return {cube, box};
}

export function createLobbyLights(environment) {
    const light = new THREE.PointLight(0x2ae312, 5);
    light.position.set(1.5, .9, .85).unproject(environment.camera);
    const light2 = new THREE.PointLight(0x2ae312, 5);
    light2.position.set(-1.5, .9, .85).unproject(environment.camera);
    environment.scene.add( light );
    environment.scene.add( light2 );
    const light4 = new THREE.PointLight(0xffffff, 2);
    light4.position.set(0, 0, 0);
    const dirLight = new THREE.DirectionalLight(0x2ae312, .2);
    dirLight.position.set(0, 0.6, 1.1);
    dirLight.target.position.set(0, 0.5, 0.8);
    environment.scene.add(dirLight.target);
    environment.scene.add(light4);    
    environment.scene.add(dirLight);  
}

export function createLobbyScene(environment) {
    const model = lobby.scene;
    const mesh = model.children[0].clone();

    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.rotateZ(Math.PI / 2);
    mesh.position.set(0, -0.5, 0.1).unproject(environment.camera);

    return(mesh);
}

async function createField() {
    const geometry = new THREE.PlaneGeometry(500, 500, 512, 512);
    const material = await createTexturedMaterial("metal_plate_scifi");
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -30);
    mesh.scale.set(0.1, 0.1, 0.1);
    return (mesh);
}

export { createField, createBorder }