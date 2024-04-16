import { createEnvironment } from "./createEnvironment.js";
import { displayCharacter } from './displayCharacter.js';
import { createLobbyLights, createLobbyScene } from './createField.js';
import { isFullScreen } from './resize.js';
import { winWidth, winHeight, charactersNames } from './varGlobal.js';

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

export function createMenuCreateTournament() {
	document.getElementById("onlineMenu").remove();
	createDivMenu("createTournament");
	const parent = document.getElementById("createTournament");
	createFormTournament(parent);
}

export function createSubmode(listName, text) {
	const firstWord = text.split(' ')[0].toLowerCase();
	const list = document.querySelector('.submode-list-' + listName);
	list.innerHTML += `<li class="submode" id="${firstWord}">${text}</li>`;
}

function createFormTournament(parent) {
	parent.innerHTML = '\
	<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>\
	<div id="createTournamentForm" class="tournament">\
	<h1 class="form-header glitched">Create Tournament</h1>\
	<form id="tournamentForm" method="post">\
	<div class="form-field">\
		<label for="name" class="form-field-name glitched">Name :</label>\
		<input class="glitched" type="text" id="name" name="name" required>\
	</div>\
	<div class="form-field">\
		<label for="max_players" class="form-field-max_players glitched">Max players :</label>\
		<input type="number" class="glitched" id="max_players" name="max_players" min="2" required>\
	</div>\
	<div class="form-field">\
		<label for="points_per_match" class="glitched form-field-max_points">Max points :</label>\
		<input class="glitched" type="number" id="points_per_match" name="points_per_match" min="1" required>\
	</div>\
	<div class="form-field form-field__private">\
		<label for="private" class="glitched">Private :</label>\
		<input type="checkbox" id="private" class="glitched" name="prive">\
	</div>\
	<div class="form-field form-field__password disabled">\
		<label for="tournamentPassword" class="glitched" >Password :</label>\
		<input type="password" class="glitched" id="tournamentPassword" name="tournamentPassword">\
	</div>\
	<div class="glitched">\
		<button class="btn-create" type="submit">Create</button>\
	</div>\
		</div>\
	</form>'

	const privateCheckbox = document.getElementById("private");
	const passwordField = document.querySelector(".form-field__password");
	privateCheckbox.addEventListener("change", (e) => {
		if (e.target.checked)
			passwordField.classList.remove("disabled");
		else
			passwordField.classList.add("disabled");
	});
}

function createTournamentInfo(name, nb) {
	const parent = document.getElementById("listTournament");
	const tournament = document.createElement("div");
	tournament.className = "tournament-info";
	const div = document.createElement("div");
	div.textContent = name;
	const div2 = document.createElement("div");
	div2.textContent = nb;
	tournament.appendChild(div);
	tournament.appendChild(div2);
	parent.appendChild(tournament);
}

function createListTournament(parent) {
	const listTournament = document.createElement("div");
	const header = document.createElement("div");
	header.className = "list-header";
	const div = document.createElement("div");
	div.textContent = "Tournaments name";
	const div2 = document.createElement("div");
	div2.textContent = "Nb";
	header.appendChild(div);
	header.appendChild(div2);
	listTournament.appendChild(header);
	listTournament.id = "listTournament";
	listTournament.classList.add("tournament")
	parent.appendChild(listTournament);
	createTournamentInfo("Tournament 1", "2/50");
}

export function createJoinTournamentMenu() {
	document.getElementById("onlineMenu").remove();
	createDivMenu("joinTournamentMenu");
	const parent = document.getElementById("joinTournamentMenu");
	parent.innerHTML = '<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>';
	createListTournament(parent);
}



export { displayMainMenu, createSelectMenu, moveCursor, createDivMenu,
		displayLobby, createWaitingScreen, createInterfaceSelectMenu, 
		createOnlineMenu};