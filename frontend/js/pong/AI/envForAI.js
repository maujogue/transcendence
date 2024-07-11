function normalize(value) {
	return value / 20.0;
}

export function getState(env, player2) {
	let state = {
		'ballPosX': normalize(env.ball.mesh.position.x),
		'ballPosY': normalize(env.ball.mesh.position.y),
		'ballVelocityX': normalize(env.ball.direction.x),
		'ballVelocityY': normalize(env.ball.direction.y),
		'agentPosY': normalize(player2.paddle.mesh.position.y)
	};

	const stateArray = Object.values(state);

	return (stateArray);
}
