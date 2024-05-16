import { displayCharacter } from "./displayCharacter.js";
import { createSelectMenu, createWaitingScreen, createInterfaceSelectMenu, createHUD} from "./menu.js";
import { handleMenuKeyPress} from "./handleKeyPress.js";
import { ClearAllEnv } from "./createEnvironment.js";
import { initGame } from "./initGame.js";
import { translateBall} from "./onlineCollision.js";
import { handlerScore, setBallData, handlerStatusMessage } from "./handlerMessage.js";
import { sendCharacter} from "./sendMessage.js";
import { characters } from "../pages/Game.js";
import { updateMixers } from "./displayCharacter.js";
import { resize } from "./resize.js";
import { getUserData } from "../User.js";
import * as THREE from 'three';

let env;
let player;
let opp;
let keysPressed = {};
let keyPress = false;
let status = {
    'ready': false,
    'start': false,
    'isReady': false,
    'exit': false,
}
let keyUp = false;
let webSocket;
let oppInfo;

document.addEventListener('fullscreenchange', function() {
	resize(env);
});

function setUserInfo(data) {
    let user = {
        'username': data['username'],
        'avatar': `data:image/png;base64, ${data['avatar']}`
    }
    return user;
}

export const playersMove = new Map();

document.addEventListener('keypress', function(event) {
    keysPressed[event.key] = true;
    keyPress = true;
    event.stopPropagation();
})

document.addEventListener("keyup", function(event) {
    delete keysPressed[event.key];
    keyPress = false;
    if (status.start && (event.key == 'w' || event.key == 's')) {
        keyUp = true;
    }
    event.stopPropagation();
});

function clickHandler(event) {
    if (event.target.id == 'restart') {
        if (document.getElementById("endscreen"))
            document.getElementById("endscreen").remove();
        sendIsReady(webSocket);
    }
    if (event.target.id == 'backMenu') {
        if (webSocket)
            webSocket.close();
    }
    if (event.target.id == 'closeMatchmaking') {
        if (webSocket)
            webSocket.close();
        document.getElementById("waitingScreen")?.remove();
        createInterfaceSelectMenu();
        document.getElementById("cursorP2").remove();
        document.getElementsByClassName("inputP2")[0].remove();
        const paddle = env.scene.getObjectByName("paddle_" + player.name);
        player.name = "player";
        paddle.name = "paddle_player";
    }
}

async function goToOnlineSelectMenu(field) {
    document.getElementsByClassName("menu")[0].remove();
    env = createSelectMenu(field, characters);
    document.getElementById("cursorP2").remove();
    document.getElementsByClassName("inputP2")[0].remove();
    env.renderer.render(env.scene, env.camera);
}


async function createOnlineSelectMenu(field) {
    status.exit = false;
    goToOnlineSelectMenu(field);
    displayCharacter(player, env, "chupacabra", "player").then((res) => {
        player = res;
        const paddle = env.scene.getObjectByName("paddle_" + player.name);
        paddle.position.x = 2.5;
        onlineGameLoop(webSocket);
    });
}

async function connectToLobby(username) {
    console.log("username: ", username);
    if (username == null)
        return ;
    webSocket = new WebSocket('wss://127.0.0.1:8000/ws/lobby/');
    
    webSocket.onopen = function() {
        console.log('Connection established');
        document.getElementById("selectMenu").remove();
        webSocket.send(JSON.stringify({
            'type': 'auth',
            'username': username,
        }));
        createWaitingScreen();
        onlineGameLoop(webSocket);
    }
    
    document.addEventListener('click', clickHandler);
    
    webSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        if (data['type'] == 'player_data') {
            const paddle = env.scene.getObjectByName("paddle_" + player.name);
            player.name = data['name'];
            paddle.name = "paddle_" + data['name'];
        }
        if (data['type'] && data['type'] == 'status')
            handlerStatusMessage(data, webSocket, env, status, player);
        if (data['type'] == 'ball_data')
            setBallData(data, env);
        if (data['type'] == 'auth' && data['status'] == 'failed') 
            webSocket.close();
        if (data['type'] == 'character_data') {
            if (data['name'] != player.name) {
                displayCharacter(opp, env, data['character'], data['name']).then((res) => {
                    opp = res;
                });
            }
        }
        if (data['type'] == 'user_info') {
            if (data['username'] == username)
                player.userInfo = setUserInfo(data);
            else 
                oppInfo = setUserInfo(data);
        }
        if (data['message'] == 'start') {
            status.gameIsInit = true;
            document.getElementById("waitingScreen")?.remove();
        }
        if (data['type'] == 'player_pos') {
            env.scene.getObjectByName("paddle_" + data['name']).position.y = data['posY'];
            playersMove.set("paddle_" + data['name'], data['move']);
        }
        if (data['type'] == 'score')
            handlerScore(data, env, player, opp);
        if (data['type'] == 'ask_character') {
            webSocket.send(JSON.stringify({
                "character": player.character.name
            }));
        }
        if (data['type'] == 'ask_user' && player.userInfo) {
            webSocket.send(JSON.stringify({
                'type': 'user_info',
                'username': username,
                'avatar': player.userInfo.avatar.split(' ')[1],
                'name': player.name
            }));
        } 
    }

    webSocket.onclose = function(e) {
        console.log('Connection closed', e.code, e.reason);
        webSocket = null;
        status.isReady = false;
        // status.exit = true;
    }

    webSocket.onerror = function(e) {
        const selectMenu = document.getElementById("selectMenu");
        const div = document.createElement("div");
        div.id = "error";
        div.innerHTML = "Error while connecting to the server";
        selectMenu.appendChild(div);
        webSocket = null;
        status.isReady = false;
    }
}

function setIsReady() {
    let ready;

    if (status.isReady) {
        status.isReady = false;
        ready = 'false';
    } else {
        status.isReady = true;
        ready = 'true';
    }
    keysPressed[' '] = false;
    return (ready);
}

function sendMove(webSocket) { 
    const move = (keysPressed["w"]) ? 1 : -1;

    if (keyPress && (keysPressed["w"] || keysPressed["s"])) {
        if (Math.sign(playersMove.get(player.name)) == move)
            return ;
        webSocket.send(JSON.stringify({
            'type': 'player_pos',
            'move': move
        }));
        keyPress = false;
        keysPressed["w"] = false;
        keysPressed["s"] = false;
    }
    if (keyUp) {
        webSocket.send(JSON.stringify({
            'type': 'player_pos',
            'move': 0
        }));
        keyUp = false;
    }
}

function movePlayers() {
    playersMove.forEach((value, key) => {
        const paddle = env.scene.getObjectByName(key);
        if (!paddle)
            return ;
        const playerBox = new THREE.Box3().setFromObject(paddle);
        if (value > 0 && !env.border.up.box.intersectsBox(playerBox))
            paddle.translateY(value);
        if (value < 0 && !env.border.down.box.intersectsBox(playerBox))
            paddle.translateY(value);
    });
}

async function sendIsReady(webSocket) {
    const status = setIsReady();
    keysPressed[' '] = false;
    keyPress = false;
    await sendCharacter(webSocket);
    webSocket.send(JSON.stringify({
        'ready': status
    }));
}

async function setGameIsStart() {
    if (player && opp && oppInfo) {
        opp.userInfo = oppInfo;
        ClearAllEnv(env);
        env = await initGame(player, opp);
        createHUD(player, opp);
        status.gameIsInit = false;
        status.start = true;
    }
}

async function onlineGameLoop(webSocket) {
    if (document.getElementById("menu")) {
        ClearAllEnv(env);
        webSocket?.close();
        keyPress = false;
        status.exit = true;
        document.removeEventListener('click', clickHandler);
    }
    if (!status.isReady && !status.start && keysPressed[' '] && !webSocket) {
        console.log('ready');
        keysPressed[' '] = false;
        getUserData('username').then((res) => {
            connectToLobby(res);
            status.isReady = true;
        })
        .catch((err) => {
            console.log(err);
        });
    }
    if (!status.start && keyPress) {
        handleMenuKeyPress(keysPressed, player, null, env);
        keyPress = false;
    }
    if (status.gameIsInit) {
        await setGameIsStart();
    }
    if (status.start && webSocket) {
        sendMove(webSocket);
        movePlayers();
        translateBall(env.ball);
        webSocket.send(JSON.stringify({ 'type': 'frame' }));
    }
    env.renderer.render(env.scene, env.camera);
    updateMixers(player, opp);
    if (!status.exit)
        requestAnimationFrame(() => onlineGameLoop(webSocket));
}

export { connectToLobby, onlineGameLoop, goToOnlineSelectMenu, createOnlineSelectMenu}