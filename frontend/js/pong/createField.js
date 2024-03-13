import * as THREE from 'three'
import { createTexturedMaterial } from './loadTextures.js';
import { lobby } from './main.js';

async function createBorder(position, camera) {
    const geometry = new THREE.BoxGeometry( 100, 2, 1 );
    const material = new THREE.MeshPhysicalMaterial( { color: 0xffffff } );
    material.metalness = 1;
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(position.x, position.y, position.z).unproject(camera);
    const box = new THREE.Box3().setFromObject(cube);
    return {
        "mesh": cube,
        "box": box
    };
}

export function createLobbyLights(environment) {
    const light = new THREE.PointLight(0xffffff, 10);
    light.position.set(0.8, .9, .85).unproject(environment.camera);
    const light2 = new THREE.PointLight(0xffffff, 10);
    light2.position.set(-0.8, .9, .85).unproject(environment.camera);
    const light3 = new THREE.PointLight(0xffffff, 10);
    light3.position.set(0, .9, .85).unproject(environment.camera);
    environment.scene.add( light );
    environment.scene.add( light2 );
    environment.scene.add( light3 );
    const light4 = new THREE.PointLight(0xffffff, 5);
    light4.position.set(0, 0, 0);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, .5);
    dirLight2.target.position.set(0, 0, 0.5);
    environment.scene.add(dirLight2.target);
    environment.scene.add(light4);    
    environment.scene.add(dirLight2);    
    // return ([light, light2]);
}

export function createLobbyScene(environment) {
    const model = lobby.scene;
    const mesh = model.children[0];

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