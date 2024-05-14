import { get_csrf_token } from "../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";

let websocket

export function connectToTournament(tournament) {
    websocket = new WebSocket(`ws://127.0.0.1:8080/ws/tournament/${tournament.id}/`);

    websocket.onopen = () => {
        createWaitingScreenTournament(tournament);
    }
    websocket.onmessage = (event) => {
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
    const tournamentName = tournament.name;
    const tournamentDiv = document.getElementsByClassName("tournament")[0];
    tournamentDiv.innerHTML = `<h1>${tournamentName}</h1>`;
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
        websocket.close();
    })
    .catch((error) => {
        console.error(error);
    });
}