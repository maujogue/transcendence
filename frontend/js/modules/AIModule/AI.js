import * as THREE from 'three';
import { getState } from './envForAI.js'

import { currentActions, actions, states } from '../gameModule/gameModule.js';

const numStateFeatures = 5;

export async function createModel() {
	const model = tf.sequential();
	model.add(tf.layers.dense({inputShape: [numStateFeatures], units: 24, activation: 'relu'}));
	model.add(tf.layers.dense({units: 24, activation: 'relu'}));
	model.add(tf.layers.dense({units: 3, activation: 'linear'}));
	model.compile({
		optimizer: tf.train.adam(0.001),
		loss: 'meanSquaredError'
	})
	return model;
}

export function moveAI(player2, state, model) {
	const prediction = model.predict(tf.tensor(state, [1, 5]));
	const maxIndexTensor = prediction.argMax(1);
	const AIAction = maxIndexTensor.squeeze().dataSync()[0]; // Convert to a numeric value

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
	// Assuming states and actions are arrays of equal lengths
	const numSamples = states.length;

	// Reshape states and actions to match the model's expectations
	const stateTensor = tf.tensor2d(states, [numSamples, numStateFeatures]);
	const actionTensor = tf.tensor2d(actions, [numSamples, 3]);
	
	// Train the model
	await model.fit(stateTensor, actionTensor, {epochs: epochs, batchSize: 32});

	console.log("Training is succesfull !");
	await model.save('downloads://model');
}

export function storeData(actualState, action) {
	states.push(actualState);
	let actionArray = (action === 0) ? [1, 0, 0] : (action === 1) ? [0, 1, 0] : [0, 0, 1];
	currentActions.push(actionArray);
}
