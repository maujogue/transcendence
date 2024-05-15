import { get_csrf_token} from "../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";
import { createJoinTournamentMenu } from "./joinTournament.js";
import { createTournamentDiv } from "./menu.js";

export let wsTournament

export async function connectToTournament(tournament) {
    wsTournament = new WebSocket(`ws://127.0.0.1:8080/ws/tournament/${tournament.id}/`);

    wsTournament.onopen = () => {
        createWaitingScreenTournament(tournament);
    }
    wsTournament.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "participants") {
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
    unsubscribeBtn.className = "unsubscribe-btn form-btn";
    tournamentDiv.appendChild(unsubscribeBtn);
	tournamentDiv.appendChild(header);
    tournamentDiv.appendChild(playerList);
    tournament.participants.map((participant) => { 
        insertPlayer(participant);
    });
}

function insertPlayer(player) {
    console.log("insert player");

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