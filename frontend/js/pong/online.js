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
import { field } from "../pages/Game.js";

let env;
let player;
let opp;
let keysPressed = {};
let keyPress = false;
let status = {
    'start': false,
    'exit': false,
    'is_connected': false,
}
let keyUp = false;
let webSocket;
let oppInfo;
let lobbyId = null;
export const playersMove = new Map();

document.addEventListener('fullscreenchange', resize(env));

function setUserInfo(data) {
    let user = {
        'username': data['username'],
        'avatar': `data:image/png;base64, ${data['avatar']}`
    }
    return user;
}

function clearVariables() {
    webSocket = null;
    player = null;
    opp = null;
    keysPressed = {};
    keyPress = false;
    status = {
        'start': false,
        'exit': false,
    }
    keyUp = false;
    webSocket = null;
    oppInfo = null;
    playersMove.clear();
}


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


function leaveMatchmaking() {
    if (webSocket)
        webSocket.close();
    document.getElementById("waitingScreen")?.remove();
    createInterfaceSelectMenu();
    removeP2Cursor();
    const paddle = env.scene.getObjectByName("paddle_" + player.name);
    player.name = "player";
    paddle.name = "paddle_player";
}


function clickHandler(event) {
    if (event.target.id == 'restart') {
        document.getElementById("endscreen")?.remove();
        sendIsReady(webSocket);
    }
    if (event.target.id == 'backMenu') {
        document.getElementById("endscreen")?.remove();
        if (webSocket)
            webSocket.close();
    }
    if (event.target.id == 'closeMatchmaking')
        leaveMatchmaking();
}

function removeP2Cursor() {
    document.getElementById("cursorP2").remove();
    document.getElementsByClassName("inputP2")[0].remove();
}


async function goToOnlineSelectMenu() {
    env = createSelectMenu(field, characters);
    removeP2Cursor();
}


async function createOnlineSelectMenu(id) {
    if (lobbyId)
        lobbyId = id;
    document.getElementsByClassName("menu")[0]?.remove();
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
    if (username == null)
        return ;
    if (!lobbyId)
        webSocket = new WebSocket('wss://127.0.0.1:8000/ws/lobby/');
    else
        webSocket = new WebSocket(`wss://127.0.0.1:8000/ws/lobby/${lobbyId}/`);

    webSocket.onopen = function() {
        status.is_connected = true;
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
            handlerStatusMessage(data, webSocket, env, status);
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
        if (data['type'] == 'player_pos')
            movePaddle(data);
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
        status.is_connected = false;
        if (status.start)
            clearVariables();
    }

    webSocket.onerror = function(e) {
        status.is_connected = false;
        const selectMenu = document.getElementById("selectMenu");
        const div = document.createElement("div");
        div.id = "error";
        div.innerHTML = "Error while connecting to the server";
        selectMenu.appendChild(div);
        webSocket = null;
    }
}

function movePaddle(data) {
    const paddle = env.scene.getObjectByName("paddle_" + data['name']);
    if (!paddle)
        return ;
    paddle.translateY(data['move']);
    if (paddle.position.y != data['posY'])
        paddle.position.y = data['posY'];
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

async function sendIsReady(webSocket) {
    await sendCharacter(webSocket);
    webSocket.send(JSON.stringify({
        'ready': 'true'
    }));
}

async function setGameIsStart() {
    if (player && opp && oppInfo) {
        opp.userInfo = oppInfo;
        ClearAllEnv(env);
        if (player.name == "player1")
            env = await initGame(player, opp);
        else
            env = await initGame(opp, player);
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
    if (keysPressed[' '] && !status.is_connected) {
        keysPressed[' '] = false;
        getUserData('username').then((res) => {
            connectToLobby(res, null)
        })
        .catch((err) => {
            console.log(err);
        });
    }
    if (!status.start && keyPress) {
        handleMenuKeyPress(keysPressed, player, null, env);
        keyPress = false;
    }
    if (status.gameIsInit)
        await setGameIsStart();
    if (status.start && webSocket) {
        translateBall(env.ball);
        sendMove(webSocket);
    }
    env.renderer.render(env.scene, env.camera);
    updateMixers(player, opp);
    if (!status.exit)
        requestAnimationFrame(() => onlineGameLoop(webSocket));
}

export { connectToLobby, onlineGameLoop, goToOnlineSelectMenu, createOnlineSelectMenu}