import { createEnvironment } from "./createEnvironment.js";
import { displayCharacter } from './displayCharacter.js';
import { createLobbyLights, createLobbyScene } from './createField.js';
import { isFullScreen } from './resize.js';
import { winWidth, winHeight, charactersNames } from './varGlobal.js';
import { createFormTournament } from "./createTournament.js";
import { initSpaceBackground } from "./spaceBackground.js";

let width = winWidth;
let height = winHeight;

function getSize() {
	if (isFullScreen()) {
		width = window.screen.width;
		height = window.screen.height;
	} else {
		width = winWidth;
		height = winHeight;
	}
}

function createIcon(parent, character) {
	const img = document.createElement("img");
	img.id = "icon_" + character;
	img.className = "charactersIcon"
	img.setAttribute("src", "assets\\img\\character_icon\\" + character + ".png");
	img.setAttribute("alt", character);
	img.style.width = "100%";
	img.style.height = "100%";
	// img.style.border = "1px solid black";
	parent.appendChild(img);
}

function createWaitingScreen() {
	createDivMenu("waitingScreen");
	const waitingScreen = document.getElementById("waitingScreen");
	waitingScreen.innerHTML = '\
		<i class="fa-solid fa-xmark close-matchmaking" id="closeMatchmaking"></i> \
		<img id="avatar_pong" src="" alt="avatar">\
		<div id="waitingText">Waiting for other player</div>';
	
}

function createSwatchPanel(leftPos, nb, character) {
	const newDiv = document.createElement("div");
	newDiv.classList.add("swatch");
	newDiv.id = "swatch" + nb;

	newDiv.style.zIndex = "100";
	newDiv.style.display = "block";
	newDiv.style.height = "50%";
	document.getElementById("panel").appendChild(newDiv);
	createIcon(newDiv, character);
}

function createCursor(swatch, cursorName, textCursor) {
	const cursor = document.createElement("p");
	const text = document.createTextNode(textCursor);
	const parent = document.getElementById(swatch);
	cursor.className = cursorName;
	cursor.id = cursorName;
	cursor.appendChild(text);
	parent.appendChild(cursor);
}

function checkIfPanelIsSelected(swatchId) {
	if (!document.getElementById(swatchId))
		return ;
	let childNodes = document.getElementById(swatchId).childNodes[1];

	if (childNodes)
		return (true);
	return (false);
}

async function moveCursor(keyPressed, player, className, env) {
	let cursor = document.getElementsByClassName(className)[0];
	if (!cursor)
		return ;
	const parent = cursor.parentNode.id;
	let parentNumber = parent[parent.length - 1];

	if (keyPressed == "d" || keyPressed == "ArrowRight") {
		parentNumber++;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber++;
		if (parentNumber >= charactersNames.length)
		parentNumber = 0;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber++;
	}
	else if (keyPressed == "q" || keyPressed == "ArrowLeft") {
		parentNumber--;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber--;
		if (parentNumber <= -1)
		parentNumber = charactersNames.length - 1;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber--;
	}

	let swatch = document.getElementsByClassName("swatch")[parentNumber];
	swatch.appendChild(cursor);
	player = displayCharacter(player, env, charactersNames[parentNumber], player.name);
}

function createDivText() {
	const divText = document.createElement("div");
	divText.id = "selectText";
	divText.style.position = 'relative';
	divText.style.zIndex = '100';
	divText.style.margin = '5%';
	divText.style.color = 'white';
	const textPress = document.createTextNode("Start with");
	
	divText.appendChild(textPress);
	const spaceSheet = document.createElement("div");
	spaceSheet.id = "spaceSheet";
	if (isFullScreen())
		spaceSheet.style.backgroundImage = "url('assets/img/sprite/spaceFullScreen.png')";
	else
		spaceSheet.style.backgroundImage = "url('assets/img/sprite/space.png')";
	divText.appendChild(spaceSheet);
	document.getElementById("selectMenu").appendChild(divText);
}

function createTitle(div) {
	const logo = document.createElement("img");
	logo.src = "./assets/img/pong.svg";
	logo.classList.add("logo");
	div.appendChild(logo);
}

function createDivMenu(id) {
	getSize();
	const div = document.createElement("div");
	div.className = "menu";
	const canvas = document.getElementById("canvas");
	div.id = id;
	div.style.width = width + 'px';
	div.style.height = height + 'px';
	div.style.fontSize = width / 25 + 'px'
	canvas.insertAdjacentHTML('beforebegin', div.outerHTML);
}

function createPanelDiv() {
	const swatch = document.createElement("div");
	
	swatch.id = "panel";
	swatch.style.position = "relative";
	swatch.style.height = "25%";
	swatch.style.color = "blue";
	document.getElementById("selectMenu").appendChild(swatch);
}

function createDivInputImg(playerName) {
	const infoDiv = document.getElementById("toggleDiv");
	const inputAnimate = document.createElement("div");
	const sprite = document.createElement("div");
	inputAnimate.className = "inputAnimate";
	inputAnimate.classList.add("input" + playerName);
	sprite.className = "sprite";
	sprite.id = "sprite" + playerName;
	if (isFullScreen())
		sprite.style.backgroundImage = "url('assets/img/sprite/" + playerName + "Sheet.png')";
	else
		sprite.style.backgroundImage = "url('assets/img/sprite/" + playerName + "SheetSmall.png')";
	const divText = document.createElement("div");
	divText.textContent = playerName + ": ";
	divText.className = "infoText";
	inputAnimate.appendChild(divText);
	infoDiv.appendChild(inputAnimate);
	inputAnimate.appendChild(sprite);
}

function createInterfaceSelectMenu() {
	getSize();
	let leftPos = 0;
	let i = 0;
	
	createDivMenu("selectMenu");
	document.getElementById("selectMenu").innerHTML = '\
		<i class="fa-solid fa-arrow-left icon" id="backIcon"></i> \
		<i class="fa-solid fa-question icon" id="toggleButton"></i> \
		<div id="toggleDiv" class="hidden"></div>';
	createPanelDiv();
	createDivInputImg("P1");
	createDivInputImg("P2");
	createDivInputImg("Start");
	charactersNames.forEach(character => {
		createSwatchPanel(leftPos, i, character);
		leftPos += (width - 11) / charactersNames.length;
		i++;
	});
	createCursor("swatch0", "cursorP1", "P1");
	createCursor("swatch1", "cursorP2", "P2");
}

function createSelectMenu(field, characters) {
	const env = createEnvironment("canvas");
	env.scene.add(createLobbyScene(env));
	createLobbyLights(env);
	createInterfaceSelectMenu();
	env.renderer.render(env.scene, env.camera);
	return {
		"renderer": env.renderer,
		"scene": env.scene,
		"camera": env.camera,
		"start": false,
		"characters": characters
	};
}

function createButton(text, id, parent) {
	const button = document.createElement('button');
	const textButton = document.createTextNode(text);
	button.className = 'btn';
	button.id = id;
	button.appendChild(textButton);
	document.getElementById(parent).appendChild(button);
}

function displayLobby() {
	createDivMenu('lobby');
	const lobby = document.getElementById('lobby');
	lobby.innerHTML = '\
	<p>Lobby Name</p><br/> \
	<input id="lobby-name-input" type="text" size="100"><br/> \
    <input id="submit" type="button" value="Enter">'
}

function displayMainMenu() {
	getSize();
	createDivMenu("menu");
	const divMenu = document.getElementById("menu");
	createTitle(document.getElementById("menu"));

	createButton("Local Game", "localGame", "menu");
	createButton("Online Game", "onlineGame", "menu");
	const fullScreenIcon = document.createElement("div");
	fullScreenIcon.innerHTML = '<i class="fa-solid fa-expand fullScreenIcon icon" id="fullScreen"></i>';

	divMenu.appendChild(fullScreenIcon);
	initSpaceBackground();
}

function createGamemodeDiv(text, parent) {
	const div = document.createElement("div");
	div.innerHTML += `<img class="gamemode-img" src="./assets/img/icon/${text}.png" alt="tournament_icon"><p>${text}</p>`;
	const list = document.createElement("ul");
	list.className = "submode-list submode-list-" + text;
	div.className = "gamemode";
	div.id = text;
	parent.appendChild(div);
	div.appendChild(list);
}

function createOnlineMenu() {
	document.getElementById("menu").remove();
	createDivMenu("onlineMenu");
	const parent = document.getElementById("onlineMenu");
	parent.innerHTML = '<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>';
	createGamemodeDiv("1v1", parent);
	createGamemodeDiv("Tournament", parent);
	createSubmode('Tournament', "Create");
	createSubmode('Tournament', "Join");
	createSubmode('1v1', "Quick Play");
	createSubmode('1v1', "Private Game");
}


export function createSubmode(listName, text) {
	const firstWord = text.split(' ')[0].toLowerCase();
	const list = document.querySelector('.submode-list-' + listName);
	list.innerHTML += `<li class="submode" id="${firstWord}">${text}</li>`;
}

export function createHUD(player, opp) {
	var player1Avatar = player.userInfo.avatar;
	var player2Avatar = opp.userInfo.avatar;
	
	if (document.getElementById("hud"))
		return ;
	if (player.name == "player2") {
		player1Avatar = opp.userInfo.avatar;
	    player2Avatar = player.userInfo.avatar;
	}
	createDivMenu("hud");
	const parent = document.getElementById("hud");
	parent.innerHTML = `\
	<img id="avatar_player1" class="avatar-in-game" src='${player1Avatar}' alt="avatar Player1">\
	<img id="avatar_player2" class="avatar-in-game" src='${player2Avatar}' alt="avatar Player2">\
	`
}

export function createTournamentDiv() {
	if (document.getElementsByClassName("menu")[0])
    	document.getElementsByClassName("menu")[0].remove();
	createDivMenu("tournamentMenu");
    const tournamentDiv = document.createElement("div");
	tournamentDiv.className = "tournament";
    document.getElementById("tournamentMenu").appendChild(tournamentDiv);
}

export { displayMainMenu, createSelectMenu, moveCursor, createDivMenu,
		displayLobby, createWaitingScreen, createInterfaceSelectMenu, 
		createOnlineMenu};