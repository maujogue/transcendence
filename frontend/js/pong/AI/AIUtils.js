import * as THREE from 'three';
import { clock } from '../../pages/game.js';

var elapsedTime = 0;
var predictions;
var firstPrediction = true;

function getGameState(environment, player2) {
	const gameState = {
		"agent": {
			"position": player2.paddle.mesh.position
		},
		"ball": {
			"position": environment.ball.mesh.position,
			"direction": environment.ball.direction
		}
	};
	console.log("Ball position: ", gameState.ball.position);
	console.log("Agent: ", gameState.agent.position);

	const inputData = [
		gameState.agent.position.x, gameState.agent.position.y,
		gameState.ball.position.x, gameState.ball.position.y,
		gameState.ball.direction.x, gameState.ball.direction.y
	];

	const inputTensor = tf.tensor2d(inputData, [1, 6]);

	return inputTensor;
}

export async function loadAgentModel() {
    try {    
		const model = await tf.loadLayersModel('../../../js/pong/AI/models/agent2____2.10avg_/model.json');
		console.log('Model loaded : ', model);
		return model;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

function performAction(action, player2, environment) {
	var playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (action == 1 && !environment.border.up.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.position.y += 0.095;
		player2.light.position.y += 0.095;
	}
	else if (action == 2 && !environment.border.down.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.position.y -= 0.095;
		player2.light.position.y -= 0.095;
	}
}

const predict = async (environment, model, player2) => {
	const gameState = getGameState(environment, player2);
	const result = model.predict(gameState);
	const values = result.dataSync();
	console.log("Prediction: ", values);
	return values;
}

async function predictAction(environment, model, player2) {
	const predictions = await predict(environment, model, player2);
	return predictions;
}

function checkElapsedTime(clock) {
	// const delta = clock.getDelta();
	// elapsedTime += delta;
	// if (elapsedTime >= 1){
	// 	elapsedTime = 0;
	// 	return true;
	// }
	// else
	// 	return false;
	return true;
}

export async function moveAI(player2, environment, model) {
	if (checkElapsedTime(clock) || firstPrediction) {
		predictions = await predictAction(environment, model, player2);
		firstPrediction = false;
	}
	const maxValue = Math.max(...predictions);
	const action = predictions.indexOf(maxValue);
	console.log("Action: ", action);
	performAction(action, player2, environment); // AI action
	return;
}



// export function getReward(environment) {
// 	if (environment.player2.score > 0)
// 		return 1;
// 	else if (environment.player1.score > 0)
// 		return -1;
// 	return 0;
// }