import * as THREE from 'three';
import { environment } from '../../pages/Game.js';

export function getGameState() {
	return {
		"player1": {
			"position": environment.player1.paddle.mesh.position,
			"score": environment.player1.score
		},
		"player2": {
			"position": environment.player2.paddle.mesh.position,
			"score": environment.player2.score
		},
		"ball": {
			"position": environment.ball.mesh.position,
			"direction": environment.ball.direction
		}
	};
}

export async function loadAgentModel() {
    try {
		const model = fetch('/frontend/js/pong/AI/models/json_model/model.json')
        // const model = await tf.loadLayersModel('/frontend/js/pong/AI/models/json_model/model.json');
        console.log('Model loaded successfully:', model);
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

export function performAction(action) {
	var playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (action == 0 && !environment.border.up.box.intersectsBox(playerBox2)) {
		environment.player2.paddle.mesh.translateY(0.15);
		environment.player2.light.position.y += 0.15;
	}
	else if (!action && !environment.border.down.box.intersectsBox(playerBox2)) {
		environment.player2.paddle.mesh.translateY(-0.15);
		environment.player2.light.position.y -= 0.15;
	}
}

export function getReward() {
	if (environment.player2.score > 0)
		return 1;
	else if (environment.player1.score > 0)
		return -1;
	return 0;
}