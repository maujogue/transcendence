import { createTournamentDiv} from "./menu.js";
import { connectToTournament } from "./tournament.js";
import { get_csrf_token } from "../ApiUtils.js";
import { displayErrorPopUp } from "./tournament.js";

let allTournaments;

async function getAllTournaments() {
    try {
        const response = await fetch('https://127.0.0.1:8000/api/tournament/list/');
        if (!response.ok) {
            throw new Error('Erreur HTTP: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Erreur:', error);
    }
}

function createTournamentInfo(tournament, currentParticipants, maxParticipants) {
	const parent = document.getElementById("tournamentsInfo");
	const tournamentDiv = document.createElement("div");
	tournamentDiv.className = "tournament-info";
    tournamentDiv.id = tournament.name;
	const div = document.createElement("div");
	div.textContent = tournament.name;
	const div2 = document.createElement("div");
	div2.textContent = currentParticipants + "/" + maxParticipants;
	tournamentDiv.appendChild(div);
	tournamentDiv.appendChild(div2);
	parent.appendChild(tournamentDiv);
    tournamentDiv.addEventListener("click", () => {
        joinTournament(tournament)
    });
}

function createDivJoinTournament(parent) {
    parent.innerHTML += '<i class="fa-solid fa-arrow-left icon" id="backIcon"></i> \
    <i class="fa-solid fa-rotate-right actualize-icon icon" id="actualizeIcon"></i>';
    const listTournament = document.getElementsByClassName("tournament")[0];
    const header = document.createElement("div");
    header.className = "list-header";
    const div = document.createElement("div");
    div.textContent = "Tournaments name";
    const div2 = document.createElement("div");
    div2.textContent = "Nb";
    const tournamentsInfo = document.createElement("div");
    tournamentsInfo.id = "tournamentsInfo";
    header.appendChild(div);
    header.appendChild(div2);
    listTournament.appendChild(header);
    listTournament.appendChild(tournamentsInfo);
    listTournament.id = "listTournament";
    listTournament.classList.add("tournament")
    
    parent.appendChild(listTournament);
    document.getElementById("actualizeIcon").addEventListener("click", () => {
        displayAllTournaments();
    });
}

async function joinTournament(tournament) {
    fetch(`https://127.0.0.1:8000/api/tournament/join/${tournament.id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": await get_csrf_token(),
        }
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.errors) {
            throw new Error(data.errors);
        }
        connectToTournament(tournament);
    })
    .catch((error) => {
        displayErrorPopUp(error);
        document.getElementById("PopUpCloseIcon")?.addEventListener("click", () => {
            displayAllTournaments();
        });
    })
}
    

async function displayAllTournaments() {
    if (document.getElementById("tournamentsInfo"))
        document.getElementById("tournamentsInfo").innerHTML = "";
    try {
        const data = await getAllTournaments();
        allTournaments = data.tournaments;
        data.tournaments.map((tournament) => {
            createTournamentInfo(tournament, tournament.participants.length, tournament.max_players);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function createListTournament(parent) {
    createDivJoinTournament(parent);
    displayAllTournaments();
}

export function createJoinTournamentMenu() {
	createTournamentDiv()
    const parent = document.getElementById("tournamentMenu");
	createListTournament(parent);
}