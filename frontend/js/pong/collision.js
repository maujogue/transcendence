import * as THREE from 'three'
import { actualizeScore } from './score.js';
import {initialP1Pos, initialP2Pos} from './initGame.js';

function resetPos(ball, player1, player2) {
    ball.mesh.position.set(0, 0, 0);
    ball.direction.y = 0;
    ball.direction.z = 0;
    player1.paddle.mesh.position.set(-8.5, 0, 0);
    player2.paddle.mesh.position.set(8.5, 0, 0);
}

async function checkIfScored(ball, player1, player2, environment) {
    let bbox1 = new THREE.Box3().setFromObject(player1.paddle.mesh);
    let bbox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);

    if (ball.mesh.position.x < bbox1.min.x - 1) {
        player2.score++;
        ball.direction.x = -0.1;
        resetPos(ball, player1, player2, environment);
        actualizeScore(player1, player2, environment, environment.font);
    }
    if (ball.mesh.position.x > bbox2.max.x + 1) {
        player1.score++; 
        ball.direction.x = 0.1;
        resetPos(ball, player1, player2, environment);
        actualizeScore(player1, player2, environment, environment.font);
    }
}

function physicsBall(ball, paddleBox) {
    let center = new THREE.Vector3();
    paddleBox.getCenter(center);

    ball.direction.x *= -1;
    if (ball.direction.x < 0 && ball.direction.x > -0.55)
        ball.direction.x -= 0.01;
    else if (ball.direction.x > 0 && ball.direction.x < 0.55)
        ball.direction.x += 0.01;
    ball.direction.z = 0.1 * (ball.mesh.position.z - center.z);
}

function checkCollisionWithBorder(ball, ballBox, environment) {
    if (environment.border.up.box.intersectsBox(ballBox) || 
        environment.border.down.box.intersectsBox(ballBox)) {
        if (ball.direction.x > 0)
            ball.direction.x += 0.01;
        else
            ball.direction.x -= 0.01;
        ball.direction.y *= -1;
        ball.direction.z *= -1;
        return (true);
    }
    return (false);
}

function checkCollision(ball, player1, player2, environment) {
    let bbox1 = new THREE.Box3().setFromObject(player1.paddle.mesh);
    let bbox2 = new THREE.Box3().setFromObject(player2.paddle.mesh);
    let ballBox = new THREE.Box3();
    
    ball.mesh.geometry.computeBoundingBox();
    ballBox.copy(ball.mesh.geometry.boundingBox).applyMatrix4(ball.mesh.matrixWorld);
    if (bbox1.intersectsBox(ballBox))
        physicsBall(ball, bbox1);
    if (bbox2.intersectsBox(ballBox))
        physicsBall(ball, bbox2);
    checkCollisionWithBorder(ball, ballBox, environment);
    ball.mesh.translateX(ball.direction.x);
    ball.mesh.translateZ(ball.direction.z);
    checkIfScored(ball, player1, player2, environment);
}

export { checkCollision, checkCollisionWithBorder, physicsBall }