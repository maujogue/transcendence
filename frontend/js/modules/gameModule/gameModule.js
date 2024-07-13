import { resize, isFullScreen } from "./resize.js";
import { checkCollision } from "./collision.js";
import { displayMainMenu, createSelectMenu, createOnlineMenu } from './menu.js';
import { handleKeyPress, handleMenuKeyPress } from './handleKeyPress.js';
import { displayCharacter, updateMixers } from './displayCharacter.js';
import { initGame } from "./initGame.js";
import { createEndScreen, returnToMenu } from "./createEndScreen.js"
import { actualizeScore } from "./score.js";
import { createField } from "./createField.js";
import { createOnlineSelectMenu } from "./online.js";
import { ClearAllEnv } from "./createEnvironment.js";
import { loadAllModel } from "./loadModels.js"
import { loadScene } from "./loadModels.js";
import { getUserData } from "../../User.js";
import { sendTournamentForm, createFormTournament } from "./createTournament.js";
import { createJoinTournamentMenu } from "./joinTournament.js";
import { checkIfUserIsInTournament, connectToTournament } from "./tournament.js";
import { getModuleDiv, updateModule } from "../../Modules.js";

import { wsTournament } from "./tournament.js";
import { createTournamentHistoryMenu } from "./tournamentHistory.js";
import * as THREE from 'three';
import { injectGameTranslations } from "../translationsModule/translationsModule.js";
import { updateWinVariables } from "./varGlobal.js";
export var lobby;
export var clock;
export var characters;

export const field = await createField();

export async function init() {
	var module = getModuleDiv("gameModule");
	if (!module)
		return;

	updateWinVariables();

	var target = document.querySelector('#game');
	var config = { attributes: true, childList: true, characterData: true };
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(injectGameTranslations);
	});
	observer.observe(target, config);

	lobby = await loadScene('lobbyTest');
	clock = new THREE.Clock();
	characters = new Map();
	let start = false;
	let divMenu = document.getElementById("menu");
	let environment;
	let player1;
	let player2;
	let keyPress = false;
	let keysPressed = {};
	let isOnline = false;
	let localLoop = false;
	let userData;
	let form;

	await loadAllModel();

	window.addEventListener('resize', resize(environment));
	
	getUserData().then((data) => {
		userData = data;
		if (userData) {
			checkIfUserIsInTournament(userData).then((response) => {
				if (response && response['joined'] && !wsTournament)
					connectToTournament(response['tournament']);
			});
		}
	})

	async function goToLocalSelectMenu() {
		divMenu = document.getElementById("menu");
		divMenu.remove();
		environment = createSelectMenu(characters);
		player1 = await displayCharacter(player1, environment, "chupacabra", "player1");
		player2 = await displayCharacter(player2, environment, "elvis", "player2");
	}

	document.addEventListener("keydown", function (event) {
		let key = event.key;
		if (event.key.match(/^[aqwd]$/))
			key = event.key.toLowerCase();
		keysPressed[key] = true;
		keyPress = true;
		event.stopPropagation();
	});

	document.addEventListener("keyup", function (event) {
		delete keysPressed[event.key];
	});


	document.body.addEventListener("click", function (event) {
		getUserData().then((data) => {
			userData = data;
		})
		
		if (event.target.id == 'restart' && !isOnline) {
			document.getElementById("endscreen").remove();
			player1.score = 0;
			player2.score = 0;
			start = true;
			actualizeScore(player1, player2, environment, environment.font);
		}
		if (event.target.id == 'backMenu' || event.target.id == 'backIcon') {
			localLoop = false;
			isOnline = false;
			ClearAllEnv(environment);
			returnToMenu();
		}
		if (event.target.id == 'localGame') {
			localLoop = true;
			localGameLoop();
			goToLocalSelectMenu();
		}
		if (event.target.id == 'onlineGame' && userData) {
			isOnline = true;
			createOnlineMenu();
		}
		if (event.target.id == 'quick') {
			createOnlineSelectMenu(null);
		}
		if (event.target.id == 'create') {
			createFormTournament();
			form = document.getElementById("tournamentForm");
			form.addEventListener('submit', function (event) {
				event.preventDefault();
				sendTournamentForm(form);
			});
		}
		if (event.target.id == 'join') {
			createJoinTournamentMenu();
		}
		if (event.target.id == 'fullScreen') {
			if (!isFullScreen())
				document.requestFullscreen();
			else
				document.exitFullscreen();
		}
		if (event.target.id == 'toggleButton') {
			const div = document.getElementById('toggleDiv');
			if (div.classList.contains('hidden'))
				div.classList.remove('hidden');
			else
				div.classList.add('hidden');
		}
		if (event.target.id == 'history') {
			createTournamentHistoryMenu();
		}
	});

	document.addEventListener('fullscreenchange', function () {
		if (!isOnline)
			resize(environment);
	});

	function setIfGameIsEnd() {
		if (player1.score < 5 && player2.score < 5)
			return;

		let winner = player1.name;
		if (player2.score > player1.score)
			winner = player2.name;

		if (winner === "player1")
			winner = "player 1";
		else if (winner === "player2")
			winner = "player 2";

		createEndScreen(winner);
		start = false;
	}

	async function localGameLoop() {
		if (keyPress && !start) {
			await handleMenuKeyPress(keysPressed, player1, player2, environment);
			keyPress = false;
		}
		if (keysPressed[" "] && document.getElementById("selectMenu") && player1 && player2 && !start) {
			start = true;
			ClearAllEnv(environment);
			divMenu.remove();
			environment = await initGame(player1, player2);
			player1.score = 0;
			player2.score = 0;
		}
		if (start) {
			console.log("start");
			if (keyPress)
				handleKeyPress(keysPressed, player1, player2, environment);
		checkCollision(environment.ball, player1, player2, environment);
		setIfGameIsEnd();
	}
	if (player1 && player2)
	updateMixers(player1, player2);
	environment?.renderer.render(environment.scene, environment.camera);
	if (localLoop)
		requestAnimationFrame(localGameLoop);
	}
}


export { displayMainMenu }