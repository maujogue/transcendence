export async function sendTournamentForm(form) {
    console.log("sendTournamentForm")
    createWaitingScreenTournament();
}

function fetchCreateTournament(form){
	const formData = new FormData(form);
	const fetchBody = {
	name: formData.get("name"),
	max_players: formData.get("max_players"),
	is_private: false,
	password: formData.get("tournamentPassword"),
	}
	console.log('Envoi du formulaire :', JSON.stringify(fetchBody));
	
	fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
		method: "GET",
		credentials: "include",
	})
	.then((response) => response.json())
	.then((data) => {
	fetch('https://127.0.0.1:8000/api/create_tournament/', {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		"X-CSRFToken": data.csrfToken,
	    },
	    credentials: "include",
	    body: JSON.stringify(fetchBody),
	})
	.then((response) => response.json())
		.then((data) => {
			if (data.error) {
				alert(data.error);
			}
			else {
				alert("Tournament created");
			}
		})
		.catch((error) => {
			console.error("create Tournament", error);
		});
	})
	.catch((error) => {
	console.error("get csrf token fail", error);
	});
}

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
