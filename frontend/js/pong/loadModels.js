import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from "./Class/Character.js";
import { charactersNames } from "./varGlobal.js";
import { characters } from './main.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


async function loadModel(fileName) {
    console.log(fileName);
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
        loader.setDRACOLoader(draco);

        loader.load('assets/models/characters/' + fileName + '.glb',
            (gltf) => {
                resolve(gltf);
            },
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
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