import * as THREE from 'three';

function movePaddle(player, keysPressed, environment) {
	let playerBox = new THREE.Box3().setFromObject(player.paddle.mesh);
	if (( keysPressed["w"] ||  keysPressed["ArrowUp"]) 
		&& !environment.border.up.box.intersectsBox(playerBox)) {
		player.paddle.mesh.translateY(0.095);
	}
	else if (( keysPressed["s"] ||  keysPressed["ArrowDown"]) 
	&& !environment.border.down.box.intersectsBox(playerBox)) {
		player.paddle.mesh.translateY(-0.095);
	}
}

export { movePaddle };