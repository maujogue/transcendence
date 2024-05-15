import { createTournamentDiv} from "./menu.js";
import { connectToTournament } from "./tournament.js";
import { get_csrf_token } from "../ApiUtils.js";

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

function createTournamentInfo(name, currentParticipants, maxParticipants) {
	const parent = document.getElementById("listTournament");
	const tournament = document.createElement("div");
	tournament.className = "tournament-info";
    tournament.id = name;
	const div = document.createElement("div");
	div.textContent = name;
	const div2 = document.createElement("div");
	div2.textContent = currentParticipants + "/" + maxParticipants;
	tournament.appendChild(div);
	tournament.appendChild(div2);
	parent.appendChild(tournament);
}

function createDivJoinTournament(parent) {
    parent.innerHTML += '<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>';
    const listTournament = document.getElementsByClassName("tournament")[0];
    const header = document.createElement("div");
    header.className = "list-header";
    const div = document.createElement("div");
    div.textContent = "Tournaments name";
    const div2 = document.createElement("div");
    div2.textContent = "Nb";
    header.appendChild(div);
    header.appendChild(div2);
    listTournament.appendChild(header);
    listTournament.id = "listTournament";
    listTournament.classList.add("tournament")
    
    parent.appendChild(listTournament);
}

function findTournament(event, allTournaments) {
    if (!(event.target.className == "tournament-info" || event.target.parentNode.className == "tournament-info"))
        return;
    var tournamentName = event.target.id;
    if (event.target.parentNode.className == "tournament-info")
        tournamentName = event.target.parentNode.id
    allTournaments.find((tournament) => {
        if (tournament.name == tournamentName)
            joinTournament(tournament);
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
    .then((response) => {
        if (!response.ok) {
            throw new Error('Erreur HTTP, statut ' + response.status);
        }
        connectToTournament(tournament);
    })
    .catch((error) => {
        console.error("join Tournament", error);
    })
}
    
async function createListTournament(parent) {
    var allTournaments

    createDivJoinTournament(parent);
    try {
        const data = await getAllTournaments();
        allTournaments = data.tournaments;
        data.tournaments.map((tournament) => {
            createTournamentInfo(tournament.name, tournament.participants.length, tournament.max_players);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }

	listTournament.addEventListener("click", (e) => {
        findTournament(e, allTournaments);
	});

}

export function createJoinTournamentMenu() {
	createTournamentDiv()
    const parent = document.getElementById("tournamentMenu");
	createListTournament(parent);
}