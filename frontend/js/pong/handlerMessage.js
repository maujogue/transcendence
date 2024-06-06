import { actualizeScoreOnline } from './onlineCollision.js';
import { displayMainMenu } from './menu.js';
import { ClearAllEnv } from './createEnvironment.js';
import { createEndScreen } from './createEndScreen.js';
import { sendColor } from './sendMessage.js';
import { playersMove } from './online.js';
import { displayErrorPopUp } from './tournament.js';
import { wsTournament } from './tournament.js';
import { toggleContentOnLogState } from '../Utils.js';
import { injectModule, updateModule } from '../Modules.js';
import { updatePage } from '../Router.js';


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
    displayErrorPopUp(message, document.getElementById("hud"));
    document.getElementById("errorPopUp").classList.add("match-error");
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        removeGameScreen(env);
        if (wsTournament) {
            wsTournament.send(JSON.stringify({
                'type': 'status',
                'status': 'endGame'
            }));
        }
        else
            displayMainMenu();
    });
    webSocket.close();
}

async function handlerEndGame(data, env) {
    if (!document.getElementById("endscreen") && !wsTournament)
        createEndScreen(data['name']);
    if (wsTournament)
        wsTournament.send(JSON.stringify({
            'type': 'status',
            'status': 'endGame'
        }));
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