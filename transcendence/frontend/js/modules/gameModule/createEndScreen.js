import { getKeyTranslation } from "../translationsModule/translationsModule.js";
import { createDivMenu } from "./menu.js"
import { displayMainMenu } from "./menu.js"
import { tournament_username } from "./online.js";

function createEndScreen(winnerName) {
    createDivMenu("endscreen");
    const div = document.getElementById("endscreen");
    div.classList.add('endscreen');

    const h3 = document.createElement('h3');
	const win = document.createElement('h3');
    h3.innerText = winnerName;
    win.setAttribute("data-lang", "win");
    const titleDiv = document.createElement('div');
    div.append(titleDiv);
    titleDiv.append(h3);
    titleDiv.append(win);

    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn-endscreen';
    restartBtn.id = 'restart';
    restartBtn.innerText = 'Play again';
	restartBtn.setAttribute("data-lang", "playagain");
	
    const backToMenuBtn = document.createElement('button');
    backToMenuBtn.className = 'btn btn-endscreen';
    backToMenuBtn.id = 'backMenu';
    backToMenuBtn.innerText = 'Back to menu';
	backToMenuBtn.setAttribute("data-lang", "backmenu");

    const btnDiv = document.createElement('div');
    btnDiv.classList.add('endscreen-btn');
    div.append(btnDiv);
    btnDiv.append(restartBtn);
    btnDiv.append(backToMenuBtn);
}

function returnToMenu() {
    const menu = document.getElementsByClassName("menu");
    menu[0].remove();
    displayMainMenu();
}

export {createEndScreen, returnToMenu }

export async function createTournamentEndScreen(winnerName) {
    createDivMenu("endscreen");
    const div = document.getElementById("endscreen");
    div.classList.add('endscreen');
    
    const h3 = document.createElement('h3');
    h3.innerText = winnerName + " " + await getKeyTranslation("win");
    const titleDiv = document.createElement('div');
    div.append(titleDiv);
    titleDiv.append(h3);

    const h2 = document.createElement('h2');
    if (tournament_username === winnerName) {
        h2.id = 'winMsg';
        h2.innerText = await getKeyTranslation("congratulations");
    }
    else {
        h2.id = 'loseMsg';
        h2.innerText = await getKeyTranslation("you_lost");
    }
    const msgDiv = document.createElement('div');
    div.append(msgDiv);
    msgDiv.append(h2);
}