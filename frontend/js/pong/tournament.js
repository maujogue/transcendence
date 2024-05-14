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
        console.log("unsubscribe");
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
    const parent = document.getElementById("player-list");
	const div = document.createElement("div");
	div.textContent = player;
    parent.appendChild(div);
}