export function connectToTournament(tournament) {
    const websocket = new WebSocket(`ws://127.0.0.1:8080/ws/tournament/${tournament.id}/`);

    websocket.onopen = () => {
        createWaitingScreenTournament(tournament);
    }
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "participants") {
            console.log(data);
            data.participants.map((participant) => {
                document.getElementById("player-list").innerHTML = "";
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
	const div = document.createElement("div");
    const playerList = document.getElementById("player-list");
	div.textContent = player;
    playerList.appendChild(div);
}