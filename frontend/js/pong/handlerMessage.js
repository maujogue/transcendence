import { actualizeScoreOnline } from './onlineCollision.js';
import { displayMainMenu } from './menu.js';
import { ClearAllEnv } from './createEnvironment.js';
import { createEndScreen } from './createEndScreen.js';
import { sendColor } from './sendMessage.js';
import { playersMove } from './online.js';
import { displayErrorPopUp } from './tournament.js';


export function setBallData(data, env) {
    if (!env.ball)
        return ;
    env.ball.direction.x = data['dirX'];
    env.ball.direction.y = data['dirY'];
    if (env.ball.mesh.position.x != data['posX'] || env.ball.mesh.position.y != data['posY']) {
        env.ball.mesh.translateX(data['posX'] - env.ball.mesh.position.x);
        env.ball.mesh.translateY(data['posY'] - env.ball.mesh.position.y);
        env.ball.mesh.position.y = data['posY'];
        env.ball.mesh.position.x = data['posX'];
    }
}

export function handlerScore(data, env, player, opp) {
    actualizeScoreOnline(data, env);
    player.paddle.mesh.position.y = 0;
    opp.paddle.mesh.position.y = 0;
    playersMove.clear();
}

function handlerStopGame(webSocket, env, message) {
    displayErrorPopUp(message, document.getElementById("hud"));
    document.getElementById("errorPopUp").classList.add("match-error");
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        ClearAllEnv(env);
        displayMainMenu();
        document.getElementById("hud").remove();
    });
    webSocket.close();
}

function handlerEndGame(data, env) {
    if (!document.getElementById("endscreen"))
        createEndScreen(data['name']);
    playersMove.clear();
    env.ball.direction.x = 0;
    env.ball.direction.y = 0;
    env.ball.mesh.position.x = 0;
    env.ball.mesh.position.y = 0;
}

function handlerPlayerDisconnect(data, env, webSocket) {
    document.getElementById("endscreen")?.remove();
    handlerStopGame(webSocket, env, data.message);
}

export function handlerStatusMessage(data, webSocket, env, status) {
    if (data['status'] == 'disconnected')
        handlerPlayerDisconnect(data, env, webSocket);
    if (data['status'] == 'stop')
        handlerStopGame(webSocket, env, data.message);
    if (data['status'] == 'endGame') {
        handlerEndGame(data, env);
    }
    if (data['status'] == 'start') {
        status.gameIsInit = true;
        document.getElementById("waitingScreen")?.remove();
    }
}