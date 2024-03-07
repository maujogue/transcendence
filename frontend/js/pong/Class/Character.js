import * as THREE from 'three';

export class Character {
	constructor(name, scene, animations) {
		this.name = name;
		this.mesh = scene.children[0];
		this.scene = scene;
		this.animations = animations;
		this.mixer = new THREE.AnimationMixer(scene);
		this.isDisplayed = false;
	}

	setCharacterInLobby(environment, posX) {
		//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

		let sign = 1;
		if (posX < 0)
			sign = -1;

		console.log(posX);
		this.mesh.scale.set(0.01, 0.01, 0.01);
		this.mesh.position.set(posX + (0.1 * sign), -0.6, 0.95).unproject(environment.camera);
		this.mesh.rotateZ(Math.PI / 8);
		environment.scene.add(this.mesh);
		//environment.scene.add(ambientLight);

	// 	this.animations.forEach((clip) => {
    //        const action = this.mixer.clipAction(clip);
    //        action.play();
    //    });
	}

	clone() {
		return (new Character(this.name, this.scene.clone(), this.animations));
	}
}
