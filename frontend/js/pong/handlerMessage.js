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
    env.ball.mesh.position.y = data['posY'];
    env.ball.mesh.position.x = data['posX'];
}

export function handlerScore(data, env, player, opp) {
    actualizeScoreOnline(data, env);
    player.paddle.mesh.position.y = 0;
    opp.paddle.mesh.position.y = 0;
    playersMove.clear();
}

function handlerStopGame(webSocket, env, start, message) {
    console.log("handlerStopGame: ", message);
    displayErrorPopUp(message, document.getElementById("hud"));
    document.getElementById("errorPopUp").classList.add("match-error");
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        ClearAllEnv(env);
        displayMainMenu();
        document.getElementById("hud").remove();
        webSocket.close();
    });
}

function handlerEndGame(data, status) {
    if (!document.getElementById("endscreen"))
        createEndScreen(data['name']);
    playersMove.clear();
}

function handlerPlayerDisconnect(data, env) {
    env.scene.remove(env.scene.getObjectByName(data['name']));
    env.renderer.render(env.scene, env.camera);
}

export function handlerStatusMessage(data, webSocket, env, status) {
    console.log(data);
    if (data['status'] == 'disconnected')
        handlerPlayerDisconnect(data, env);
    if (data['status'] == 'stop')
        handlerStopGame(webSocket, env, status.start, data.message);
    if (data['status'] == 'endGame') {
        handlerEndGame(data, status);
    }
    if (data['status'] == 'start') {
        status.gameIsInit = true;
        document.getElementById("waitingScreen")?.remove();
    }
}