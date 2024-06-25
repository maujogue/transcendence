import { createDivMenu } from "./menu.js"
import { ClearAllEnv } from "./createEnvironment.js"
import { displayMainMenu } from "./menu.js"

function createEndScreen(winnerName) {
    createDivMenu("endscreen");
    const div = document.getElementById("endscreen");
    div.classList.add('endscreen');

    const h3 = document.createElement('h3');
    h3.innerText = winnerName + " WIN";
    const titleDiv = document.createElement('div');
    div.append(titleDiv);
    titleDiv.append(h3);

    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn';
    restartBtn.id = 'restart';
    restartBtn.innerText = 'Play again';

    const backToMenuBtn = document.createElement('button');
    backToMenuBtn.className = 'btn';
    backToMenuBtn.id = 'backMenu';
    backToMenuBtn.innerText = 'Back to menu';

    const btnDiv = document.createElement('div');
    div.append(btnDiv);
    btnDiv.append(restartBtn);
    btnDiv.append(backToMenuBtn);
}

function returnToMenu() {
    console.log("returnToMenu");
    const menu = document.getElementsByClassName("menu");
    menu[0].remove();
    displayMainMenu();
}

export {createEndScreen, returnToMenu }

//TODO change player name for local and online