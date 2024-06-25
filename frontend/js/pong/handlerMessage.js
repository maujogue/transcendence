import { actualizeScoreOnline } from './onlineCollision.js';
import { displayMainMenu } from './menu.js';
import { ClearAllEnv } from './createEnvironment.js';
import { createEndScreen } from './createEndScreen.js';
import {createTournamentEndScreen } from './createEndScreen.js';
import { playersMove } from './online.js';
import { displayErrorPopUp } from './tournament.js';
import { wsTournament } from './tournament.js';
import { updateModule } from '../Modules.js';

export function checkIfWebsocketIsOpen(webSocket) {
    if (webSocket && webSocket.readyState == webSocket.OPEN)
        return true;
    return false;
}


export function setBallData(data, env) {
    if (!env.ball)
        return ;
    env.ball.direction.x = data['dirX'];
    env.ball.direction.y = data['dirY'];
    if (env.ball.mesh.position.x != data['posX'] || env.ball.mesh.position.y != data['posY']) {
        env.ball.mesh.translateX(data['posX'] - env.ball.mesh.position.x);
        env.ball.mesh.translateY(data['posY'] - env.ball.mesh.position.y);
    }
}

export function handlerScore(data, env, player, opp) {
    actualizeScoreOnline(data, env);
    player.paddle.mesh.position.y = 0;
    opp.paddle.mesh.position.y = 0;
    playersMove.clear();
}

export function removeGameScreen(env) {
    ClearAllEnv(env);
    document.getElementById("hud")?.remove();
}
    

function handlerStopGame(webSocket, env, message) {
    console.log("handlerStopGame");
    displayErrorPopUp(message, document.getElementsByClassName("menu")[0]);
    document.getElementById("errorPopUp").classList.add("match-error");
    webSocket.close();
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        if (checkIfWebsocketIsOpen(wsTournament)) {
            wsTournament.send(JSON.stringify({
                'type': 'status',
                'status': 'endGame'
            }));
            removeGameScreen(env);
        }
        else
            displayMainMenu();
    });
}

export async function handlerEndGame(data, env, webSocket) {
    if (!document.getElementById("endscreen") && !checkIfWebsocketIsOpen(wsTournament))
        createEndScreen(data['name']);
    if (checkIfWebsocketIsOpen(wsTournament)) {
        createTournamentEndScreen(data['name']);
        webSocket.close();
        setTimeout(() => {
            wsTournament.send(JSON.stringify({
                'type': 'status',
                'status': 'endGame'
            }));
            document.getElementById("endscreen")?.remove();
            removeGameScreen(env);
        }, 5000);
    }
    playersMove.clear();
    env.ball.direction.x = 0;
    env.ball.direction.y = 0;
    env.ball.mesh.position.x = 0;
    env.ball.mesh.position.y = 0;
	await updateModule("statisticsModule");
}

function handlerPlayerDisconnect(data, env, webSocket) {
    document.getElementById("endscreen")?.remove();
    handlerStopGame(webSocket, env, data.message);
}

export function handlerStatusMessage(data, webSocket, env, status) {
    console.log("status", data);
    if (data['status'] == 'disconnected')
        handlerPlayerDisconnect(data, env, webSocket);
    if (data['status'] == 'stop')
        handlerStopGame(webSocket, env, data.message);
    if (data['status'] == 'endGame') {
        handlerEndGame(data, env, webSocket);
    }
    if (data['status'] == 'start') {
        status.gameIsInit = true;
        document.getElementById("waitingScreen")?.remove();
    }
}