import { displayCharacter } from "./displayCharacter.js";
import { createSelectMenu } from "./menu.js";
import { handleMenuKeyPress} from "./handleKeyPress.js";
import { ClearAllEnv } from "./createEnvironment.js";
import { initGame } from "./initGame.js";
import { getColorChoose } from "./getColorChoose.js";
import { displayMainMenu } from "./menu.js";
import { translateBall, actualizeScoreOnline } from "./onlineCollision.js";
import { createEndScreen } from "./createEndScreen.js";
import { returnToMenu } from "./createEndScreen.js";
import * as THREE from 'three';

let env;
let player;
let opp;
let keysPressed = {};
let keyPress = false;
let gameIsInit = false;
let isReady = false;
let start = false;
let keyUp = false;
let name;
let ball = {
    positionX: 0,
    positionY: 0,
    dirX: 0.055,
    dirY: 0,
}

const playersMove = new Map();

document.addEventListener('keypress', function(event) {
    keysPressed[event.key] = true;
    keyPress = true;
    event.stopPropagation();
})

document.addEventListener("keyup", function(event) {
    delete keysPressed[event.key];
    keyPress = false;
    if (start && (event.key == 'w' || event.key == 's')) {
        keyUp = true;
    }
    event.stopPropagation();
});


async function goToOnlineSelectMenu(field) {
    document.getElementById("menu").remove();
    env = createSelectMenu(field);
    document.getElementById("cursorP2").remove();
    env.renderer.render(env.scene, env.camera);
}

async function connectToLobby(field) {
    const webSocket = new WebSocket('ws://localhost:8000/ws/lobby/1/');
    

    webSocket.onopen = function() { 
        console.log('Connection established');
        goToOnlineSelectMenu(field);
        onlineGameLoop(webSocket);
    }
    
    document.addEventListener('click', function (event) {
        if (event.target.id == 'restart') {
            document.getElementById("endscreen").remove();
            sendIsReady(webSocket);
        }
    });
    
    webSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        console.log(data);
        if (data['type'] == 'player_data') {
            name = data['name'];
            displayCharacter(player, env, data['color'], name).then((res) => {
                player = res;
            });
        }

        if (data['type'] && data['type'] == 'status') {
            if (data['message'] == 'connected')
                sendColor(webSocket);
            if (data['message'] == 'disconnected') {
                console.log('disconnected');
                env.scene.remove(env.scene.getObjectByName(data['name']));
                env.renderer.render(env.scene, env.camera);
            }
            if (data['message'] == 'stopGame') {
                start = false;
                ClearAllEnv(env);
                displayMainMenu();
                webSocket.close();
            }
            if (data['message'] == 'endGame') {
                console.log('endGame');
                if (!document.getElementById("endscreen"))
                createEndScreen(data['name']);
            isReady = false;
                start = false;
            }
        }
        if (data['type'] == 'ball_data') {
            console.log('ball_data');
            if (env.ball) {
                env.ball.direction.x = data['dirX'];
                env.ball.direction.y = data['dirY'];
                env.ball.mesh.position.y = data['posY'];
                env.ball.mesh.position.x = data['posX'];
            }
            ball.dirX = data['dirX'];
            ball.dirY = data['dirY'];
        }
        if (data['color_data']) {
            displayCharacter(opp, env, data['color_data'], data['name']).then((res) => {
                opp = res;
            });
        }
        if (data['message'] == 'start') {
            console.log('start');
            gameIsInit = true;
        }
        if (data['type'] == 'player_pos')
            env.scene.getObjectByName(data['name']).position.y = data['posY'];
            playersMove.set(data['name'], data['move']);
        if (data['type'] == 'score') {
            console.log('score', data['score'], data['name']);
            actualizeScoreOnline(data, env);
            player.paddle.mesh.position.y = 0;
            opp.paddle.mesh.position.y = 0;
        }
    }


    webSocket.onerror = (error) => {
        // Handle errors here
        console.error('WebSocket Error: ', error);
    };

    webSocket.onclose = function(e) {
        console.log('Connection closed');
    }
    
}

async function sendColor(webSocket) {
    const color = getColorChoose('cursorP1');
    displayCharacter(player, env, color, name).then((res) => {
        player = res;
    });
    await webSocket.send(JSON.stringify({
        'color': color
    }));
    console.log('sendColor');
}


function setIsReady() {
    let status;

    if (isReady) {
        isReady = false;
        status = 'false';
    } else {
        isReady = true;
        status = 'true';
    }
    keysPressed['Enter'] = false;
    return (status);
}

function sendMove(webSocket) { 
    const move = (keysPressed["w"]) ? 1 : -1;

    if (keyPress && (keysPressed["w"] || keysPressed["s"])) {
        if (Math.sign(playersMove.get(name)) == move)
            return ;
        webSocket.send(JSON.stringify({
            'type': 'player_pos',
            'move': move,
            'posY': player.paddle.mesh.position.y
        }));
        keyPress = false;
        keysPressed["w"] = false;
        keysPressed["s"] = false;
    }
    if (keyUp) {
        webSocket.send(JSON.stringify({
            'type': 'player_pos',
            'move': 0,
            'posY': player.paddle.mesh.position.y
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
        if (value > 0 && !env.border.up.box.intersectsBox(playerBox)) {
            paddle.translateY(value);
        }
        else if (value < 0 && !env.border.down.box.intersectsBox(playerBox)) {
            paddle.translateY(value);
        }
    });
}

function sendIsReady(webSocket) {
    const status = setIsReady();  
    keysPressed['Enter'] = false;
    keyPress = false;
    webSocket.send(JSON.stringify({
        'ready': status
    }));
}


async function setGameIsStart() {
    if (player && opp) {
        ClearAllEnv(env);
        env = await initGame(player, opp);
        console.log(env.ball.mesh.position.x);
        gameIsInit = false;
        console.log('setGameIsStart');
        start = true;
        env.ball.direction.x = ball.dirX;
        env.ball.direction.y = ball.dirY;
        env.renderer.render(env.scene, env.camera);
    }
}


async function onlineGameLoop(webSocket) {
    if (document.getElementById("menu")) {
        ClearAllEnv(env);
        webSocket.close();
        keyPress = false;
    }
    if (!start && keysPressed['Enter'])
        sendIsReady(webSocket);
    if (!start && keyPress) {
        console.log('handleMenuKeyPress');
        handleMenuKeyPress(keysPressed, player, null, env);
        await sendColor(webSocket);
        keyPress = false;
    }
    if (gameIsInit)
        await setGameIsStart();
    if (start) {
        sendMove(webSocket);
        movePlayers();
        translateBall(env.ball);
        webSocket.send(JSON.stringify({ 'type': 'frame' }));
    }
    env.renderer.render(env.scene, env.camera);
    requestAnimationFrame(() => onlineGameLoop(webSocket));
}

export { connectToLobby }