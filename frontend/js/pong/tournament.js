import { get_csrf_token} from "../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";
import { getUserData } from "../User.js";
import { createOnlineSelectMenu } from "./online.js";
import { createTournamentDiv } from "./menu.js";
import { wsMatch } from "./online.js";
import { drawBracket, getTournamentBracket } from "./createBracket.js";

export let wsTournament
let userData;

export async function connectToTournament(tournament) {
    try {
        wsTournament = new WebSocket(`ws://127.0.0.1:8080/ws/tournament/${tournament.id}/`);
    
        wsTournament.onopen = () => {
            createWaitingScreenTournament(tournament);
            fillUserData().then(sendUsername);
        };
    
        wsTournament.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);
            if (data.type == "participants")
                displayPlayerList(data.participants);
            if (data.type == "matchup") {
                createOnlineSelectMenu(data.match.lobby_id);
            }
            if (data.type == "status")
                handlerMessageStatus(data);
            if (data.type == "bracket") {
                createTournamentDiv();
                drawBracket(data.bracket);
            }
        };
        
        wsTournament.onerror = (error) => {
            console.error("Websocket error observed:", error);
        };
        
        wsTournament.onclose = (event) => {
            console.log("Websocket connection closed:", event);
        };
    } catch(err) {
        console.error("Failed to connect to WebSocket:", err);
    }
}

function handlerMessageStatus(data) {
    console.log("Status:", data.status);
    if (data.status == "endGame")
        wsMatch?.close();
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



export async function unsubscribeFromTournament(tournament) {
    fetch(`https://127.0.0.1:8000/api/tournament/${tournament.id}/quit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": await get_csrf_token(),
        },
    })
    .then((response) => {
        if (!response.ok)
            throw new Error("Error while unsubscribing from tournament");
        returnToMenu();
        wsTournament.close();
    })
    .catch((error) => {
        console.error(error);
    });
}

export async function checkIfUserIsInTournament(user) {
    return fetch(`https://127.0.0.1:8000/api/tournament/check-subscribed/${user.username}/`, {
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
    errorPopUp.className = "error-pop-up";
    errorPopUp.innerHTML = ` \
    <i id="PopUpCloseIcon" class="fa-solid fa-xmark close-icon"></i> \
    <p>${message}</p> `;
    parent.appendChild(errorPopUp);
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        document.getElementById("PopUpCloseIcon").removeEventListener("click", () => {});
        errorPopUp.remove();
    });
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
    const unsubscribeBtn = document.createElement("button");
    unsubscribeBtn.textContent = "Unsubscribe";
    unsubscribeBtn.onclick = () => {
        unsubscribeFromTournament(tournament);
    }
    unsubscribeBtn.className = "unsubscribe-btn";
    tournamentDiv.appendChild(unsubscribeBtn);
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