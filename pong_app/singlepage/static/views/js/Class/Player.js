class Player {
	constructor(name, paddle, light) {
		this.name = name,
		this.paddle = paddle,
		this.light = light,
		this.score = 0,
		this.ready = false
	}
}

export { Player };