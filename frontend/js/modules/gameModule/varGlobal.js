export var winWidth = document.getElementById("content-container").getBoundingClientRect().width * 8/12;
export var winHeight = winWidth * 9 / 16;
export const charactersNames = ['chupacabra', 'elvis', 'granny', 'peasant'];
export const colors = new Map();
colors.set('chupacabra', "rgb(160, 2, 217)");
colors.set('elvis', "rgb(209, 201, 212)");
colors.set('granny', "rgb(0, 128, 255)");
colors.set('peasant', "rgb(173, 62, 2)");
export const lobbyCharPos = -0.5;
export const lobbyPaddlePos = -0.3;

export function updateWinVariables() {
	winWidth = document.getElementById("content-container").getBoundingClientRect().width * 8/12;
	winHeight = winWidth * 9 / 16;
	var gameModule = document.querySelector('.gameModule');
	var game = document.querySelector('#game');
	var pongImg = document.querySelector('.pongImg');
	var profileCard = document.querySelector('#profileCard');
	pongImg.width = winWidth;
	game.style.width = winWidth + 'px';
	game.style.height = winHeight + 'px';
	gameModule.style.width = winWidth + 'px';
	// profileCard.style.height = gameModule.style.height;
	profileCard.style.maxHeight = gameModule.style.height +'px';
}

