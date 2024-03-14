
class Player {
	constructor(name, paddle, [light, light2], character) {
		this.name = name;
		this.paddle = paddle;
		this.light = [light, light2];
		this.score = 0;
		this.ready = false;
		this.character = character;
	}

	setCharacter(environment, characterName) {
		if (this.character)
			this.character.mesh.remove();
		this.character = environment.characters.get(characterName).clone();
	}
}

export { Player };