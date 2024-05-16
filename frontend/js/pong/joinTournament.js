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
	const parent = document.getElementById("tournamentsInfo");
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
    const tournamentsInfo = document.createElement("div");
    tournamentsInfo.id = "tournamentsInfo";
    header.appendChild(div);
    header.appendChild(div2);
    listTournament.appendChild(header);
    listTournament.appendChild(tournamentsInfo);
    listTournament.id = "listTournament";
    listTournament.classList.add("tournament")
    
    parent.appendChild(listTournament);
}

function displayErrorPopUp (message) {
    console.error("displayErrorPopUp", message);
    const parent = document.getElementsByClassName("tournament")[0];
    const errorPopUp = document.createElement("div");
    errorPopUp.className = "error-pop-up";
    errorPopUp.innerHTML = ` \
    <i id="PopUpCloseIcon" class="fa-solid fa-xmark close-icon"></i> \
    <p>${message}</p> `;
    parent.appendChild(errorPopUp);
    document.getElementById("PopUpCloseIcon").addEventListener("click", () => {
        errorPopUp.remove();
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
    })
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

async function displayAllTournaments() {
    var allTournaments;

    document.getElementById("tournamentsInfo").innerHTML = "";
    try {
        const data = await getAllTournaments();
        allTournaments = data.tournaments;
        console.log(data.tournaments);
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

async function createListTournament(parent) {
    createDivJoinTournament(parent);
    displayAllTournaments();
}

export function createJoinTournamentMenu() {
	createTournamentDiv()
    const parent = document.getElementById("tournamentMenu");
	createListTournament(parent);
}