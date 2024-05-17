import { get_csrf_token} from "../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";
import { createJoinTournamentMenu } from "./joinTournament.js";
import { createTournamentDiv } from "./menu.js";

export let wsTournament

export async function connectToTournament(tournament) {
    wsTournament = new WebSocket(`wss://127.0.0.1:8000/ws/tournament/${tournament.id}/`);

    wsTournament.onopen = () => {
        createWaitingScreenTournament(tournament);
    }
    
    wsTournament.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "participants") {
            if (document.getElementById("player-list"))
                document.getElementById("player-list").innerHTML = "";
            data.participants.map((participant) => {
                insertPlayer(participant);
            });
        }
    }
}

export function createWaitingScreenTournament(tournament) {
    if (!tournament)
        return;
    if (!document.getElementsByClassName("tournament")[0])
        createTournamentDiv();
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

function insertPlayer(player) {
	const div = document.createElement("div");
    const playerList = document.getElementById("player-list");
	div.textContent = player;
    playerList.appendChild(div);
}

async function unsubscribeFromTournament(tournament) {
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

export function displayErrorPopUp (message) {
    console.error("displayErrorPopUp", message);
    const parent = document.getElementsByClassName("tournament")[0];
    const errorPopUp = document.createElement("div");
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