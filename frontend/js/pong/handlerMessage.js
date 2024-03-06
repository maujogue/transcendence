import { actualizeScoreOnline } from './onlineCollision.js';
import { displayMainMenu } from './menu.js';
import { ClearAllEnv } from './createEnvironment.js';
import { createEndScreen } from './createEndScreen.js';
import { sendColor } from './sendMessage.js';

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
}

function handlerStopGame(webSocket, env, start) {
    start = false;
    ClearAllEnv(env);
    displayMainMenu();
    webSocket.close();
}

function handlerEndGame(data, status) {
    if (!document.getElementById("endscreen"))
        createEndScreen(data['name']);
    status.isReady = false;
    status.start = false;
}

function handlerPlayerDisconnect(data, env) {
    env.scene.remove(env.scene.getObjectByName(data['name']));
    env.renderer.render(env.scene, env.camera);
}

export function handlerStatusMessage(data, webSocket, env, status, player) {
    if (data['message'] == 'connected') {
        sendColor(webSocket);
        displayCharacter(player, env, color, data["name"]).then((res) => {
            player = res;
        });
    }
    if (data['message'] == 'disconnected')
        handlerPlayerDisconnect(data, env);
    if (data['message'] == 'stopGame')
        handlerStopGame(webSocket, env, status.start);
    if (data['message'] == 'endGame') {
        handlerEndGame(data, status);
    }
}