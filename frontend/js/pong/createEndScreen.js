import { createDivMenu } from "./menu.js"
import { ClearAllEnv } from "./createEnvironment.js"
import { displayMainMenu } from "./menu.js"

function setEndingDivStyle(div)
{
    // div.style.position = 'absolute';
    // div.style.color = 'white';
    // div.style.textAlign = 'center';
    // div.style.padding = '10% 0';
    // div.style.fontSize = '1em';
    // div.style.top = '0';
}

function createEndScreen(winnerName) {
    createDivMenu("endscreen");
    const div = document.getElementById("endscreen");
    setEndingDivStyle(div);
    const h3 = document.createElement('h3');
    h3.innerText = winnerName + " WIN";
    div.append(h3);
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn';
    restartBtn.id = 'restart';
    restartBtn.innerText = 'Play again';
    const backToTheMenuBtn = document.createElement('button');
    backToTheMenuBtn.className = 'btn';
    backToTheMenuBtn.id = 'backMenu';
    backToTheMenuBtn.innerText = 'Back to the menu';

    div.append(restartBtn);
    div.append(document.createElement('br'));
    div.append(backToTheMenuBtn);
}

function returnToMenu() {
    console.log("returnToMenu");
    const menu = document.getElementsByClassName("menu");
    menu[0].remove();
    displayMainMenu();
}

export {createEndScreen, returnToMenu }