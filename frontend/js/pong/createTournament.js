import { createWaitingScreenTournament } from "./tournament.js";
import { get_csrf_token } from "../ApiUtils.js";

export async function sendTournamentForm(form) {
    console.log("sendTournamentForm")
	fetchCreateTournament(form).then(() => {;
		console.log("fetchCreateTournament");
	});
}

async function fetchCreateTournament(form){
	const formData = new FormData(form);
	const fetchBody = {
		name: formData.get("name"),
		max_players: formData.get("max_players"),
		is_private: false,
		password: formData.get("tournamentPassword"),
	}
	console.log('Envoi du formulaire :', JSON.stringify(fetchBody));
	
	fetch('https://127.0.0.1:8000/api/tournament/create/', {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		"X-CSRFToken": await get_csrf_token(),
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
	})
	.catch((error) => {
		console.error("create Tournament", error);
	});
}

export function createFormTournament(parent) {
	parent.innerHTML = '\
	<i class="fa-solid fa-arrow-left icon" id="backIcon"></i>\
	<div id="createTournamentForm" class="tournament">\
	<h1 class="form-header glitched">Create Tournament</h1>\
	<form id="tournamentForm" method="post">\
	<div class="form-field">\
		<label for="name" class="form-field-name glitched">Name :</label>\
		<input class="glitched" type="text" id="name" name="name" required>\
	</div>\
	<div class="form-field">\
		<label for="max_players" class="form-field-max_players glitched">Max players :</label>\
		<input type="number" class="glitched" id="max_players" name="max_players" min="2" required>\
	</div>\
	<div class="form-field">\
		<label for="points_per_match" class="glitched form-field-max_points">Max points :</label>\
		<input class="glitched" type="number" id="points_per_match" name="points_per_match" min="1" required>\
	</div>\
	<div class="form-field form-field__private">\
		<label for="private" class="glitched">Private :</label>\
		<input type="checkbox" id="private" class="glitched" name="prive">\
	</div>\
	<div class="form-field form-field__password disabled">\
		<label for="tournamentPassword" class="glitched" >Password :</label>\
		<input type="password" class="glitched" id="tournamentPassword" name="tournamentPassword">\
	</div>\
	<div class="glitched">\
		<button class="form-btn" type="submit">Create</button>\
	</div>\
		</div>\
	</form>'

	const privateCheckbox = document.getElementById("private");
	const passwordField = document.querySelector(".form-field__password");
	privateCheckbox.addEventListener("change", (e) => {
		if (e.target.checked)
			passwordField.classList.remove("disabled");
		else
			passwordField.classList.add("disabled");
	});
}
