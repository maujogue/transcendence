export async function sendTournamentForm(form) {
    createWaitingScreenTournament();
    // const formData = new FormData(form);
    // const fetchBody = {
    //     name: formData.get("name"),
    //     max_players: formData.get("max_players"),
    //     is_private: false,
    //     password: formData.get("tournamentPassword"),
    // }
    // console.log('Envoi du formulaire :', JSON.stringify(fetchBody));

    // fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
	// 	method: "GET",
	// 	credentials: "include",
	// })
	// .then((response) => response.json())
	// .then((data) => {
    //     fetch('https://127.0.0.1:8000/api/create_tournament/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             "X-CSRFToken": data.csrfToken,
    //         },
    //         credentials: "include",
    //         body: JSON.stringify(fetchBody),
    //     })
    //     .then((response) => response.json())
	// 	.then((data) => {
	// 		if (data.error) {
	// 			alert(data.error);
	// 		}
	// 		else {
	// 			alert("Tournament created");
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.error("create Tournament", error);
	// 	});
    // })
    // .catch((error) => {
    //     console.error("get csrf token fail", error);
    // });
}

function createWaitingScreenTournament() {
    const tournamentName = "HerrrCup" 
    const form = document.getElementById("createTournamentForm");
    form.id = "listPlayers";
    form.innerHTML = `<h1>${tournamentName}</h1>`;
	const header = document.createElement("div");
	header.className = "list-header";
	header.textContent = "Players";
	form.appendChild(header);
	form.appendChild(listPlayers);
    insertPlayer("Herrrmann");

}

function insertPlayer(name) {
    console.log("insert player", name);
    const parent = document.getElementById("listPlayers");
	const tournament = document.createElement("div");
	tournament.className = "player-list";
	const div = document.createElement("div");
	div.textContent = name;
	tournament.appendChild(div);
	parent.appendChild(tournament);
}