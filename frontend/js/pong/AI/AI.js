import { resetEnv, moveAgents, getState, getRewards } from './envForAI.js'
import { updateMixers } from "../displayCharacter.js"

import { environment, actions, states } from '../../pages/game.js';
import { ReplayBuffer } from "./ReplayBuffer.js";

const numActions = 3;
const numStateFeatures = 6;

let epsilon = 1.0;
const discountFactor = 0.99;
const episodes = 10000;
const batchSize = 500;

function createModel() {
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

function chooseAction(state, model, rand) {
	console.log("Rand : ", rand);
	console.log("Epsilon : ", epsilon);
	if (rand < epsilon) {
		//Explore : random action
		console.log("Explore");
		return (Math.floor(Math.random() * numActions))
	}
	else {
		//Exploit : choose action with the highest q-value
		console.log("Exploit");
		console.log("State : ", state.shape);
		const qValues = model.predict(state);
		return tf.argMax(qValues, 1).dataSync()[0];
	}
}

async function trainModel(experiences, model) {
    for (const experience of experiences) {
		const state = experience.state;
		const reward = experience.reward;
		const next_state = experience.nextState;
        // const {state, action, reward, next_state, done} = experience;

        // Predict Q-values for all actions
		const qValues = model.predict(next_state).arraySync();
		console.log("qValues:", qValues.dtype);

		console.log("Reward:", reward);
		console.log("Discount Factor:", discountFactor);
		
		// Calculate target Q-values for each action
		const targetQValues = qValues.map(qValue => reward + qValue);
		console.log("Q Value : ", targetQValues);

		// Convert targetQValues to a tensor if needed for further processing
		const targetQValueTensor = tf.tensor(targetQValues, [1, 3]);
        await model.fit(state, targetQValueTensor, {epochs: 1});
    }
}


export async function train(player1, player2) {
	const model = await createModel();
	const opponent = await createModel();
	const replayBuffer = new ReplayBuffer(10000);

	for (let episode = 0; episode < episodes; episode++) {
		let state = await resetEnv(environment, player1, player2);
		let totalReward = 0;
		let done = false;
		const rand = Math.random();

		while (true) {
			let reward = 0;
			const action1 = chooseAction(state, opponent, rand);
			const action2 = chooseAction(state, model, rand);
			moveAgents(player1, player2, [action1, action2], environment);
			reward = getRewards(environment, player1, player2);
			if (reward == 5 || reward == -5)
				done = true;
			const nextState = getState(environment, player1, player2);
			console.log("Reward : ", reward);

			//Update replay buffer
			replayBuffer.addExperience({state, action2, reward, nextState, done});

			//Update NN
			console.log("Length : ", replayBuffer.buffer.length);
			if (replayBuffer.buffer.length >= batchSize) {
				const experiences = replayBuffer.sample(batchSize);
				trainModel(experiences, model);
			}
			
			state = nextState;
			totalReward = totalReward + reward;

			updateMixers(player1, player2);
			environment?.renderer.render(environment.scene, environment.camera);
			// requestAnimationFrame(train);

			if (done)
				break;

		}

		if (epsilon > 0.1)
			epsilon = epsilon - 0.001;

		console.log(`Episode ${episode}: Total Reward = ${totalReward}`);
	}

	await model.save('downloads://model');
	await opponent.save('downloads://opponent');

}

export function storeData(env, player1, player2, action) {
	states.push(getState(env, player1, player2));
	actions.push(action);
}
