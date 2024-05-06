export function createWaitingScreenTournament() {
    const tournamentName = "HerrrCup" 
    const tournament = document.getElementsByClassName("tournament")[0];
    tournament.innerHTML = `<h1>${tournamentName}</h1>`;
    tournament.id = "PlayerList";
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
    tournament.appendChild(unsubscribeBtn);
	tournament.appendChild(header);
    tournament.appendChild(playerList);
    insertPlayer("Herrrmann");
}

function insertPlayer(name) {
    const parent = document.getElementById("player-list");
	const div = document.createElement("div");
	div.textContent = name;
    parent.appendChild(div);
}