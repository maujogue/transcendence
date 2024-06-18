import { get_csrf_token} from "../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";
import { getUserData } from "../User.js";
import { clearOnlineVariables, createOnlineSelectMenu } from "./online.js";
import { createTournamentDiv } from "./menu.js";
import { createLeaveButton, drawBracket} from "./createBracket.js";
import { hostname } from "../Router.js";
import { wsMatch } from "./online.js";

export let wsTournament
export let tournamentStatus;
export let playerStatus;
let userData;
let currentTournament;

export async function connectToTournament(tournament) {
    try {
        console.log("Connecting to tournament:", tournament);
        currentTournament = tournament;
        wsTournament = new WebSocket(`ws://${hostname}:8080/ws/tournament/${tournament.id}/`);
    
        wsTournament.onopen = () => {
            createWaitingScreenTournament(tournament);
            fillUserData().then(sendUsername);
        };
    
        wsTournament.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);
            if (data.type == "participants")
                displayPlayerList(data.participants);
            if (data.type == "matchup")
                createOnlineSelectMenu(data.match.lobby_id);
            if (data.type == "status")
                handlerMessageStatus(data);
            if (data.type == "ranking")
                displayRankingScreen(data);
            if (data.type == "bracket") {
                createTournamentDiv();
                drawBracket(data.bracket);
            }
        };
        
        wsTournament.onerror = (error) => {
            console.error("Websocket error observed:", error);
        };
        
        wsTournament.onclose = (event) => {
            playerStatus = null;
            tournamentStatus = null;
            clearOnlineVariables();
            console.log("Websocket connection closed:", event);
        };
    } catch(err) {
        console.error("Failed to connect to WebSocket:", err);
    }
}


function handlerMessageStatus(data) {
    console.log("Status:", data.status);
    if (data.status == "disqualified") {
        playerStatus = "disqualified";
        // displayErrorPopUp("You have been disqualified", document.getElementsByClassName("tournament")[0]);
    }
    if (data.status == "endTournament")
        tournamentStatus = "finished";
    if (data.status == "start")
        tournamentStatus = "started";
    if (data.status == "waiting")
        tournamentStatus = "waiting";
} 

function displayRankingScreen(data) {
    if (!document.getElementsByClassName("tournament")[0])
        createTournamentDiv();
    const tournamentDiv = document.getElementsByClassName("tournament")[0];
    tournamentDiv.innerHTML = `<h1 class="won-title">${data.winner} won the tournament!</h1>`;
    displayTournamentRanking(data.ranking);
    createLeaveButton(tournamentDiv);
    createShowBracketButton(tournamentDiv);
}

function displayTournamentRanking(ranking) {
    const rankingDiv = document.createElement("div");
    rankingDiv.className = "ranking";
    rankingDiv.innerHTML = "<h2>Ranking</h2>";
    let pos = 1;
    for (let key in ranking) {
        console.log(`${pos}: ${key}`);
        const div = document.createElement("div");
        div.textContent = `${pos}: ${key}`;
        rankingDiv.appendChild(div);
        pos++;
    }
    document.getElementsByClassName("tournament")[0].appendChild(rankingDiv);
}

function displayPlayerList(participants) {
    console.log("displayPlayerList");
    if (document.getElementById("player-list"))
        document.getElementById("player-list").innerHTML = "";
    participants.map((participant) => insertPlayer(participant));
}

async function fillUserData() {
    await getUserData().then((data) => {
        userData = data;
    });
}

async function sendUsername() {
    wsTournament.send(JSON.stringify({
        'type': 'auth',
        'username': userData.username,
    }));
}

export async function unsubscribeFromTournament() {
    console.log("Unsubscribing from tournament: ", currentTournament);
    fetch(`https://${hostname}:8000/api/tournament/${currentTournament.id}/quit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": await get_csrf_token(),
        },
    })
    .then((response) => {
        if (!response.ok)
            throw new Error("Error while unsubscribing from tournament");
        console.log("Unsubscribed from tournament");
        returnToMenu();
        wsTournament.close();
    })
    .catch((error) => {
        console.error(error);
    });
}

export async function checkIfUserIsInTournament(user) {
    return fetch(`https://${hostname}:8000/api/tournament/check-subscribed/${user.username}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": await get_csrf_token(),
        },
    })
    .then((response) => {
        if (!response.ok)
            throw new Error("Error while checking if user is in tournament");
        return response.json();
    })
    .catch((error) => {
        console.error(error);
        return false;
    });
}

export function displayErrorPopUp (message, parent) {
    // console.error("displayErrorPopUp", message);
    const errorPopUp = document.createElement("div");
    errorPopUp.id = "errorPopUp";
    errorPopUp.className = "error-pop-up pop-up";
    errorPopUp.innerHTML = ` \
    <i id="PopUpCloseIcon" class="fa-solid fa-xmark close-icon icon"></i> \
    <p>${message}</p> `;
    parent.appendChild(errorPopUp);
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        document.getElementById("PopUpCloseIcon").removeEventListener("click", () => {});
        errorPopUp.remove();
    });
}

function displayMatchup(match) {
    const popup = document.createElement("div");
    popup.className = "matchup-pop-up pop-up";
    popup.innerHTML = ` \
    <i id="PopUpCloseIcon" class="fa-solid fa-xmark close-icon icon"></i> \
    <h2>${match.round}</h2> \
    <p>${match.player_1} VS ${match.player_2}</p>`;
    document.getElementsByClassName("tournament")[0].appendChild(popup);
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => createOnlineSelectMenu(match.lobby_id))
}

export function createShowBracketButton(parent) {
    const seeBracketBtn = document.createElement("button");
    seeBracketBtn.textContent = "Show bracket";
    seeBracketBtn.className = "show-bracket-btn end-tournament-btn tournament-btn";
    parent.appendChild(seeBracketBtn);
    seeBracketBtn.onclick = () => ask_bracket();
}

function ask_bracket() {
    wsTournament.send(JSON.stringify({
        'type': 'bracket',
    }));
}

export function createUnsubscribeButton(parent) {
    const unsubscribeBtn = document.createElement("button");
    unsubscribeBtn.textContent = "Unsubscribe";
    unsubscribeBtn.onclick = () => unsubscribeFromTournament();
    unsubscribeBtn.className = "unsubscribe-btn tournament-btn";
    parent.appendChild(unsubscribeBtn);
}

export function createWaitingScreenTournament(tournament) {
    if (!tournament)
        return;
    if (!document.getElementsByClassName("tournament")[0])
        createTournamentDiv();
    document.getElementById("backIcon")?.remove();
    document.getElementById("actualizeIcon")?.remove();
    const tournamentDiv = document.getElementsByClassName("tournament")[0];
    tournamentDiv.innerHTML = `<h1>${tournament.name}</h1>`;
    tournamentDiv.id = "PlayerList";
	const header = document.createElement("div");
	header.className = "list-header";
	header.textContent = "Players";
    const playerList = document.createElement("div");
    playerList.className = "player-list";
    playerList.id = "player-list";
    createUnsubscribeButton(tournamentDiv);
	tournamentDiv.appendChild(header);
    tournamentDiv.appendChild(playerList);
    tournament.participants.map((participant) => { 
        insertPlayer(participant);
    });
}

export function insertPlayer(player) {
	const div = document.createElement("div");
    const playerList = document.getElementById("player-list");
	div.textContent = player;
    playerList?.appendChild(div);
}