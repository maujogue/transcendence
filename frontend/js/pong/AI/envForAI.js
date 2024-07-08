import { ClearAllEnv } from "../createEnvironment.js";
import { initGame } from "../initGame.js";

function normalize(value) {
	return value / 255.0;
}

function convertToTensor(normalizedState) {
	const tensorState = tf.tensor([
		normalizedState.ballPosX,
		normalizedState.ballPosY,
		normalizedState.ballVelocityX,
		normalizedState.ballVelocityY,
		normalizedState.playerPosY,
		normalizedState.agentPosY
	]);

	const reshapedTensor = tensorState.reshape([1, 6]);

	return (reshapedTensor);
}

export function getState(env, player1, player2) {
	let state = {
		'ballPosX': normalize(env.ball.mesh.position.x),
		'ballPosY': normalize(env.ball.mesh.position.y),
		'ballVelocityX': normalize(env.ball.direction.x),
		'ballVelocityY': normalize(env.ball.direction.y),
		'playerPosY': normalize(player1.paddle.mesh.position.y),
		'agentPosY': normalize(player2.paddle.mesh.position.y)
	};

	const tensorState = convertToTensor(state);

	return (tensorState);
}

export async function resetEnv(env, player1, player2) {
	if (env)
		ClearAllEnv(env);
	env = await initGame(player1, player2);
	let state = getState(env, player1, player2);

	return (state);
}