import * as THREE from 'three';
import { clock } from '../../pages/game.js';

var elapsedTime = 0;
var predictions;
var firstPrediction = true;

function getGameState(player1, player2, environment) {
	const gameState = {
		"player1": {
			"position": player1.paddle.mesh.position,
			"score": player1.score
		},
		"player2": {
			"position": player2.paddle.mesh.position,
			"score": player2.score
		},
		"ball": {
			"position": environment.ball.mesh.position,
			"direction": environment.ball.direction
		}
	};

	const inputData = [
		gameState.player1.position.x, gameState.player1.position.y,
		gameState.player1.score,
		gameState.player2.position.x, gameState.player2.position.y,
		gameState.player2.score,
		gameState.ball.position.x, gameState.ball.position.y,
		gameState.ball.direction.x, gameState.ball.direction.y
	];

	const inputTensor = tf.tensor2d(inputData, [1, 10]);

	return inputTensor;
}

export async function loadAgentModel() {
    try {    
		const model = await tf.loadLayersModel('../../../js/pong/AI/models/agent2___-0.20avg_ copy/model.json');
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
		player2.paddle.mesh.translateY(0.095);
		player2.light.position.y += 0.095;
	}
	else if (action == 2 && !environment.border.down.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(-0.095);
		player2.light.position.y -= 0.095;
	}
}

const predict = async (gameState, model) => {
	const result = model.predict(gameState, { batchSize: 64 });
	const values = result.dataSync();
	console.log("Prediction: ", values);
	return values;
}

async function predictAction(player1, player2, environment, model) {
	const gameState = getGameState(player1, player2, environment);
	console.log("Game State: ", gameState.dataSync());
	const predictions = await predict(gameState, model);
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

export async function moveAI(player1, player2, environment, model) {
	if (checkElapsedTime(clock) || firstPrediction) {
		predictions = await predictAction(player1, player2, environment, model);
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