import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from "./Class/Character.js";
import { charactersNames } from "./varGlobal.js";
import { characters } from './main.js';

async function loadModel(fileName) {
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

export async function loadAllModel() {
    charactersNames.forEach(async (characterName) => {
        try {
            const gltf = await loadModel(characterName);
            characters.set(characterName, new Character(characterName, gltf.scene, gltf.animations));
        } catch (error) {
			console.error('Error loading model:', error);
        }
    });
}