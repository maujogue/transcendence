import { createDivMenu } from "./menu.js";
import { createWaitingScreenTournament } from "./tournament.js";

async function getAllTournaments() {
    try {
        const response = await fetch('./js/pong/dev/tournament.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement du fichier JSON');
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
    const listTournament = document.createElement("div");
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

async function createListTournament(parent) {
    var allTournaments

    createDivJoinTournament(parent);
    try {
        const data = await getAllTournaments();
        allTournaments = data.tournaments;
        data.tournaments.map((tournament) => {
            createTournamentInfo(tournament.name, tournament.currentParticipants, tournament.maxParticipants);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }

	listTournament.addEventListener("click", (e) => {
		if (e.target.className == "tournament-info" || e.target.parentNode.className == "tournament-info")
            var tournamentName = e.target.id;
            if (e.target.parentNode.className == "tournament-info")
                tournamentName = e.target.parentNode.id
            console.log(tournamentName);
            allTournaments.find((tournament) => {
                if (tournament.name == tournamentName)
                    createWaitingScreenTournament(tournament);
            });
	});

}

export function createJoinTournamentMenu() {
	document.getElementById("onlineMenu").remove();
	createDivMenu("joinTournamentMenu");
	const parent = document.getElementById("joinTournamentMenu");
	parent.innerHTML = '<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>';
	createListTournament(parent);
}