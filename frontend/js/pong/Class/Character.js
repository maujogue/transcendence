import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export class Character {
	constructor(name, scene, animations) {
		this.name = name;
		this.mesh = scene.children[0];
		this.scene = scene;
		this.animations = animations;
		this.isDisplayed = false;
	}

	setCharacterInLobby(environment, posX) {
		this.mesh.scale.set(0.005, 0.005, 0.005);
		if (posX < 0) {
			this.mesh.position.set(posX - 0.1, -0.6, 0.12).unproject(environment.camera);
			this.mesh.rotateZ(Math.PI / -4);
		}
		else {
			this.mesh.position.set(posX + 0.1, -0.6, 0.12).unproject(environment.camera);
			this.mesh.rotateZ(Math.PI / 4);
		}
		environment.scene.add(this.mesh);

		this.mixer = new THREE.AnimationMixer(this.mesh);

		const animation = this.animations[0];
		const action = this.mixer.clipAction(animation);
		action.play();
	}

	clone() {
		// Create a new instance of Character
		const clonedCharacter = new Character(this.name, this.scene.clone(), this.animations.slice());
	
		// Copy properties individually
		clonedCharacter.mesh = SkeletonUtils.clone(this.mesh);
		clonedCharacter.mixer = new THREE.AnimationMixer(clonedCharacter.scene);
	
		// Copy other properties if necessary
		clonedCharacter.isDisplayed = this.isDisplayed;
	
		return clonedCharacter;
	}
}
