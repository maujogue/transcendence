import { resetEnv } from './envForAI.js'
import { environment } from '../../pages/game.js';

const numActions = 3;
const numStateFeatures = 6;

const epsilon = 0.1;
const discountFactor = 0.99;
const episodes = 1000;
const batchSize = 64;

const model = await createModel();

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

function chooseAction(state, epsilon) {
	if (Math.random() < epsilon) {
		//Explore : random action
		console.log("Explore");
		return (Math.floor(Math.random() * numActions))
	}
	else {
		//Exploit : choose action with the highest q-value
		console.log("Exploit");
		const qValues = model.predict(tf.tensor2d([state], [1, numStateFeatures]));
		return tf.argMax(qValues, 1).dataSync()[0];
	}
}

export async function train(player1, player2) {
	for (let episode = 0; episode < episodes; episode++) {
		const state = resetEnv(environment, player1, player2);
		let totalReward = 0;

		while (true) {
			const action = chooseAction(state, epsilon);
			console.log("Action : ", action);
			const nextState = env.step(action);
			const reward = nextState.reward;

			//Update NN
			const targetQValue = reward + discountFactor * tf.max(model.predict(tf.tensor2d([nextState.state], [1, numStateFeatures])))[0];
			model.fit(tf.tensor2d([state.state], [1, numStateFeatures]), tf.tensor2d([action, targetQValue]), {epochs: 1});

			state = nextState;
			totalReward += reward;

			if (env.done) break;
		}

		console.log(`Episode ${episode}: Total Reward = ${totalReward}`);
	}
}
