import * as THREE from 'three';
import { getState } from './envForAI.js'

import { currentActions, actions, states, clockAI, setTimer } from '../gameModule/gameModule.js';
import { checkElapsedTime, resetElapsedTime } from './envForAI.js';

const numStateFeatures = 5;
const numOutputs = 3;

export async function createModel() {
	const model = tf.sequential();
	model.add(tf.layers.dense({inputShape: [numStateFeatures], units: 24, activation: 'relu'}));
	model.add(tf.layers.dense({units: 24, activation: 'relu'}));
	model.add(tf.layers.dense({units: numOutputs, activation: 'linear'}));
	model.compile({
		optimizer: tf.train.adam(0.001),
		loss: 'meanSquaredError'
	})
	return model;
}

function moveAI(player2, state, model, env) {
	const prediction = model.predict(tf.tensor(state, [1, 5]));
	const maxIndexTensor = prediction.argMax(1);
	const AIAction = maxIndexTensor.squeeze().dataSync()[0];

	if (!player2)
		return;
	let playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (AIAction == 1 && !env.border.up.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(0.15);
		player2.light.position.y += 0.15;
	}
	else if (AIAction == 2 && !env.border.down.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(-0.15);
		player2.light.position.y -= 0.15;
	}

	return (AIAction);
}

export async function trainModel(model, epochs) {
	const numSamples = states.length;

	const stateTensor = tf.tensor2d(states, [numSamples, numStateFeatures]);
	const actionTensor = tf.tensor2d(actions, [numSamples, numOutputs]);
	
	await model.fit(stateTensor, actionTensor, {epochs: epochs, batchSize: 64});

	console.log("Training is succesfull !");
	await model.save('downloads://model');
}

export function storeData(actualState, action) {
	states.push(actualState);
	let actionArray = (action === 0) ? [1, 0, 0] : (action === 1) ? [0, 1, 0] : [0, 0, 1];
	currentActions.push(actionArray);
}

export function AIMovement(player2, model, env) {
	let actualState;

	if (!setTimer)
		actualState = getState(env, player2);
	else if (checkElapsedTime(clockAI) || firstPrediction) {
		actualState = getState(env, player2);
		firstPrediction = false;
	}
	return (moveAI(player2, actualState, model, env));
}

export function resetAITimer(player1, player2, firstPrediction) {
	if (player1.hasScored || player2.hasScored) {
		firstPrediction = true;
		resetElapsedTime();
		player1.hasScored = false;
		player2.hasScored = false;
	}
}
