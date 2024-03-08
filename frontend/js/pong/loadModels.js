import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadModel(fileName) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();

        loader.load('assets/models/characters/' + fileName + '.glb',
            (gltf) => {
                resolve(gltf);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
                reject(error);
            }
        );
    });
}

export async function loadScene(fileName) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();

        loader.load('assets/models/scenes/' + fileName + '.glb',
            (gltf) => {
                resolve(gltf);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
                reject(error);
            }
        );
    });
}