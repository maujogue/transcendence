import { ClearAllEnv } from "../createEnvironment.js";
import { initGame } from "../initGame.js";
import { checkCollision } from "../collision.js";

import * as THREE from 'three';

function normalize(value) {
	return value / 20.0;
}

// function convertToTensor(normalizedState) {
// 	const tensorState = tf.tensor([
// 		normalizedState.ballPosX,
// 		normalizedState.ballPosY,
// 		normalizedState.ballVelocityX,
// 		normalizedState.ballVelocityY,
// 		normalizedState.playerPosY,
// 		normalizedState.agentPosY
// 	], [1, 6]);

// 	return (tensorState);
// }

export function getState(env, player2) {
	let state = {
		'ballPosX': normalize(env.ball.mesh.position.x),
		'ballPosY': normalize(env.ball.mesh.position.y),
		'ballVelocityX': normalize(env.ball.direction.x),
		'ballVelocityY': normalize(env.ball.direction.y),
		'agentPosY': normalize(player2.paddle.mesh.position.y)
	};

	const stateArray = Object.values(state);

	// console.log("Data array : ", stateArray);

	//const stateTensor = tf.tensor(stateArray, [1, stateArray.length]);

	return (stateArray);
}

export function getStateReversed(env, player1) {
	let state = {
		'ballPosX': normalize((-1) * env.ball.mesh.position.x),
		'ballPosY': normalize(env.ball.mesh.position.y),
		'ballVelocityX': normalize((-1) * env.ball.direction.x),
		'ballVelocityY': normalize(env.ball.direction.y),
		'agentPosY': normalize(player1.paddle.mesh.position.y)
	};

	const stateArray = Object.values(state);

	// console.log("Data array : ", stateArray);

	//const stateTensor = tf.tensor(stateArray, [1, stateArray.length]);

	return (stateArray);
}

export function moveAgents(player1, player2, actions, env) {
	let playerBox1;
	let playerBox2;
	let action1 = actions[0];
	let action2 = actions[1];
	console.log("Actions : ", action1, action2);
	
	if (!player1)
		return;
	playerBox1 = new THREE.Box3().setFromObject(player1.paddle.mesh);
	if (action1 == 1 && !env.border.up.box.intersectsBox(playerBox1)) {
		player1.paddle.mesh.translateY(0.15);
		player1.light.position.y += 0.15;
	}
	if (action1 == 2 && !env.border.down.box.intersectsBox(playerBox1)) {
		player1.paddle.mesh.translateY(-0.15);
		player1.light.position.y -= 0.15;
	}

	if (!player2)
		return;
	playerBox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
	if (action2 == 1 && !env.border.up.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(0.15);
		player2.light.position.y += 0.15;
	}
	if (action2 == 2 && !env.border.down.box.intersectsBox(playerBox2)) {
		player2.paddle.mesh.translateY(-0.15);
		player2.light.position.y -= 0.15;
	}
}

export async function resetEnv(env, player1, player2) {
	if (env)
		ClearAllEnv(env);
	env = await initGame(player1, player2);
	let state = await getState(env, player1, player2);

	return (state);
}

function checkEnd(player1, player2) {
	let reward = 0;

	if (player1.score < 5 && player2.score < 5)
		return (reward);

	if (player1.score == 5)
		reward = -5;
	else
		reward = 5;

	return (reward);
}

export function getRewards(env, player1, player2) {
	let reward = 0;

	const agent_score = player2.score;
	const opponent_score = player1.score;

	checkCollision(env.ball, player1, player2, env);
	reward = checkEnd(player1, player2);

	if (reward != 0)
		return (reward);
	
	if (agent_score < player2.score)
		reward = 1;
	else if (opponent_score < player1.score)
		reward = -1;

	return (reward);
}