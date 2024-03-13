import * as THREE from 'three';
import { createEnvironment, createMap } from "./createEnvironment.js";
import { displayCharacter } from './displayCharacter.js';
import { createLobbyLights, createLobbyScene } from './createField.js';
import { winWidth, winHeight } from './varGlobal.js';
import { isFullScreen } from './resize.js';
import { lobby } from './main.js';

const colors = ['ffffff', 'ff0000', '0000ff', '00ff00', 'ffff00', 'ff00ff', '00ffff', 'ff8800'];
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

function createSwatchPanel(leftPos, nb, color) {
	const newDiv = document.createElement("div");
	newDiv.classList.add("swatch");
	newDiv.id = "swatch" + nb;

	newDiv.style.zIndex = "100";
	newDiv.style.display = "block";
	newDiv.style.left = leftPos + "px";
	newDiv.style.bottom = "0px";
	newDiv.style.width = (width / colors.length) + "px";
	newDiv.style.height = "100%";
	newDiv.style.background = "#" + color;
	// newDiv.style.border = "5px solid brown";
	document.getElementById("panel").appendChild(newDiv);
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
	let childNodes = document.getElementById(swatchId).childNodes[0];

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
		if (parentNumber >= colors.length)
		parentNumber = 0;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber++;
	}
	else if (keyPressed == "q" || keyPressed == "ArrowLeft") {
		parentNumber--;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber--;
		if (parentNumber <= -1)
		parentNumber = colors.length - 1;
		if (checkIfPanelIsSelected("swatch" + parentNumber))
			parentNumber--;
	}

	let swatch = document.getElementsByClassName("swatch")[parentNumber];
	swatch.appendChild(cursor);
	let color = cursor.parentNode.style.backgroundColor;
	displayCharacter(player, env, color, player.name);
}

function createDivText() {
	const divText = document.createElement("div");
	divText.id = "selectText";
	divText.style.position = 'relative';
	divText.style.zIndex = '100';
	divText.style.margin = '5%';
	divText.style.color = 'white';
    const textChooseColor = document.createTextNode("Choose your color");
	const breakLine = document.createElement("br");
	const textStart = document.createTextNode("Press 'Espace' for start");
	textChooseColor.id = "textChooseColor";
	
    divText.appendChild(textChooseColor);
	divText.appendChild(breakLine);
	divText.appendChild(textStart);
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
	swatch.style.height = "10%";
	swatch.style.color = "blue";
	document.getElementById("selectMenu").appendChild(swatch);
}

function createSelectMenu(field, characters) {
	getSize();
	const env = createEnvironment("canvas");
	let leftPos = 0;
	let i = 0;

	createDivMenu("selectMenu");
	createDivText();
	createPanelDiv();
	colors.forEach(color => {
		createSwatchPanel(leftPos, i, color);
		leftPos += (width - 11) / colors.length;
		i++;
	});
	createCursor("swatch0", "cursorP1", "P1");
	createCursor("swatch1", "cursorP2", "P2");
	env.scene.add(createLobbyScene(env));
	createLobbyLights(env);
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
	fullScreenIcon.innerHTML = '<i class="fa-solid fa-expand fullScreenIcon" id="fullScreen"></i>';

	divMenu.appendChild(fullScreenIcon);
}

export { displayMainMenu, createSelectMenu, moveCursor, createDivMenu, displayLobby};