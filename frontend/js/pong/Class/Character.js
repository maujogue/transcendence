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

	setCharacterInLobby(playerName, environment, posX) {
		this.mesh.scale.set(0.07, 0.07, 0.07);
		if (posX < 0) {
			this.mesh.position.set(posX - 0.1, -0.6, 0.95).unproject(environment.camera);
			this.mesh.rotateZ(Math.PI / -4);
		}
		else {
			this.mesh.position.set(posX + 0.1, -0.6, 0.95).unproject(environment.camera);
			this.mesh.rotateZ(Math.PI / 4);
		}
		this.mesh.name = playerName;
		this.setAnimation(0)
		environment.scene.add(this.mesh);
	}
	
	setAnimation(animationIndex) {
		const animation = this.animations[animationIndex];
		if (!animation)
			return ;

		this.mixer = new THREE.AnimationMixer(this.mesh);
		const action = this.mixer.clipAction(animation);
		action.play();
	}

	clone() {
		const clonedCharacter = new Character(this.name, this.scene.clone(), this.animations.slice());
	
		clonedCharacter.mesh = SkeletonUtils.clone(this.mesh);
		clonedCharacter.mixer = new THREE.AnimationMixer(clonedCharacter.scene);
	
		clonedCharacter.isDisplayed = this.isDisplayed;
	
		return clonedCharacter;
	}
}
