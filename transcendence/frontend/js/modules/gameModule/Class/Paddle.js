import * as THREE from 'three';

class Paddle {
	constructor(mesh) {
		this.direction = new THREE.Vector2(0, 0),
		this.mesh = mesh;
	}
};

export { Paddle };