import { get_csrf_token } from "../../ApiUtils.js";
import { returnToMenu } from "./createEndScreen.js";
import { getUserData } from "../../User.js";
import { clearOnlineVariables, createOnlineSelectMenu } from "./online.js";
import { createTournamentDiv } from "./menu.js";
import { createLeaveButton, drawBracket} from "./createBracket.js";
import { hostname } from "../../Router.js";
import { wsMatch } from "./online.js";
import { checkIfWebsocketIsOpen, handlerEndGame } from "./handlerMessage.js";
import { getKeyTranslation } from "../translationsModule/translationsModule.js";

export let wsTournament
export let tournamentStatus;
export let playerStatus;
let userData;
let currentTournament;

export async function connectToTournament(tournament) {
    try {
        console.log("Connecting to tournament:", tournament);
        currentTournament = tournament;
        wsTournament = new WebSocket(`wss://${hostname}:8000/ws/tournament/${tournament.id}/`);
    
        wsTournament.onopen = () => {
            createWaitingScreenTournament(tournament);
            fillUserData().then(sendUsername);
        };

        wsTournament.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);
            if (data.type == "participants")
                displayPlayerList(data.participants);
            if (data.type == "matchup") {
                createOnlineSelectMenu(data.match.lobby_id);
                await displayTimer(data.timer)
            }
            if (data.type == "status")
                await handlerMessageStatus(data);
            if (data.type == "ranking")
                displayRankingScreen(data);
            if (data.type == "bracket") {
                createTournamentDiv();
                drawBracket(data.bracket);
            }
        };
        
        wsTournament.onerror = (error) => {
            console.error("Websocket error observed:", error);
        };
        
        wsTournament.onclose = (event) => {
            // #TODO Affiche un message d'erreur si la websocket se ferme a cause d'une erreur
            playerStatus = null;
            tournamentStatus = null;
            clearOnlineVariables();
            console.log("Websocket connection closed:", event);
        };
    } catch(err) {
        console.error("Failed to connect to WebSocket:", err);
    }
}

async function displayTimer(time) {
    const timerDiv = document.createElement("div");
    timerDiv.id = "timer";
    timerDiv.classList.add("timer");
    timerDiv.innerHTML = await getKeyTranslation("time_left") + time;
    document.getElementById("selectMenu")?.appendChild(timerDiv);
    setInterval(async () => {
        if (time == 0)
            return ;
        time--;
        timerDiv.innerHTML = await getKeyTranslation("time_left") + time;
    }, 1000);
}

async function handlerMessageStatus(data) {
    console.log("Status:", data.status);
    if (data.status == "disqualified") {
        playerStatus = "disqualified";
        // displayErrorPopUp("You have been disqualified", document.getElementsByClassName("tournament")[0]);
    }
    if (data.status == "endTournament")
        tournamentStatus = "finished";
    if (data.status == "start")
        tournamentStatus = "started";
    if (data.status == "waiting") {
        tournamentStatus = "waiting";
        ask_tournament_status();
    }
    if (data.status == "cancelled") {
        await displayErrorPopUp(data['message'], document.getElementById('game'));
        if (checkIfWebsocketIsOpen(wsMatch)) {
            wsMatch.close();
            clearOnlineVariables();
        }
    }
}

async function ask_tournament_status() {
    setInterval(() => {
        if (tournamentStatus != "waiting" || !checkIfWebsocketIsOpen(wsTournament) || playerStatus == "disqualified")
            return ;
        wsTournament.send(JSON.stringify({
            'type': 'ask_status',
        }));
    }, 60000)
}

function displayRankingScreen(data) {
	var div = document.getElementsByClassName("tournament")[0];
	if (div)
		div.remove();
	createTournamentDiv();
    const tournamentDiv = document.getElementsByClassName("tournament")[0];
    tournamentDiv.innerHTML = `<h1 class="won-title">${data.winner} <span data-lang="tournament_won"></span></h1>`;
    displayTournamentRanking(data.ranking);
    createLeaveButton(tournamentDiv);
    createShowBracketButton(tournamentDiv);
}

function displayTournamentRanking(ranking) {
    console.log("displayTournamentRanking: ", ranking);
    const rankingDiv = document.createElement("div");
    rankingDiv.className = "ranking";
    rankingDiv.innerHTML = "<h2 class='ranking-title' data-lang='ranking'></h2>";
    const podiumDiv = document.createElement("div");
    podiumDiv.className = "podium";
    const podium = ["🥇", "🥈", "🥉"]
    const otherDiv = document.createElement("div"); 
    otherDiv.className = "other";
    let pos = 1;
    ranking.reverse();
    ranking.map((player) => {
        if (player != null) {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player";
            if (pos < 4) {
                playerDiv.innerHTML = `<p>${podium[pos - 1]} ${player}</p>`;
                podiumDiv.appendChild(playerDiv);
            } else {
                playerDiv.innerHTML = `<p>${pos}. ${player}</p>`;
                otherDiv.appendChild(playerDiv);
            }
            pos++;
        }
    });
    rankingDiv.appendChild(podiumDiv);
    rankingDiv.appendChild(otherDiv);
    document.getElementsByClassName("tournament")[0].appendChild(rankingDiv);
}


function displayPlayerList(participants) {
    console.log("displayPlayerList");
    if (document.getElementById("player-list"))
        document.getElementById("player-list").innerHTML = "";
    participants.map((participant) => insertPlayer(participant));
}

async function fillUserData() {
    await getUserData().then((data) => {
        userData = data;
    });
}

async function sendUsername() {
    wsTournament.send(JSON.stringify({
        'type': 'auth',
        'username': userData.username,
    }));
}

export async function unsubscribeFromTournament() {
    console.log("Unsubscribing from tournament: ", currentTournament);
    fetch(`https://${hostname}:8000/api/tournament/${currentTournament.id}/quit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": await get_csrf_token(),
        },
    })
    .then((response) => {
        if (!response.ok)
            throw new Error("Error while unsubscribing from tournament");
        console.log("Unsubscribed from tournament");
        returnToMenu();
        wsTournament.close();
    })
    .catch((error) => {
        console.error(error);
    });
}

export async function checkIfUserIsInTournament(user) {
    return fetch(`https://${hostname}:8000/api/tournament/check-subscribed/${user.username}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": await get_csrf_token(),
        },
    })
    .then((response) => {
        if (!response.ok)
            throw new Error("Error while checking if user is in tournament");
        return response.json();
    })
    .catch((error) => {
        console.error(error);
        return false;
    });
}

export async function displayErrorPopUp (message, parent) {
    // console.log("displayErrorPopUp", message);
    const errorPopUp = document.createElement("div");
    errorPopUp.id = "errorPopUp";
    errorPopUp.className = "error-pop-up pop-up";
	console.log("message", message);
	var errorText = await getKeyTranslation(message);
	console.log("errorText", errorText);
	if (!errorText)
    	errorPopUp.innerText = message;
	else
		errorPopUp.innerText = errorText;
    parent.appendChild(errorPopUp);
    setTimeout(() => {
        if (document.getElementById("errorPopUp"))
            document.getElementById("errorPopUp").remove();
    }, 3000);
}

export function createShowBracketButton(parent) {
    const seeBracketBtn = document.createElement("button");
	seeBracketBtn.setAttribute("data-lang", "show_bracket");
    seeBracketBtn.className = "show-bracket-btn end-tournament-btn tournament-btn";
    parent.appendChild(seeBracketBtn);
    seeBracketBtn.onclick = () => ask_bracket();
}

function ask_bracket() {
    wsTournament.send(JSON.stringify({
        'type': 'bracket',
    }));
}

export async function createUnsubscribeButton(parent) {
    const unsubscribeBtn = document.createElement("button");
	unsubscribeBtn.setAttribute("data-lang", "unsubscribe");
	unsubscribeBtn.innerText = await getKeyTranslation("unsubscribe");
    unsubscribeBtn.onclick = () => unsubscribeFromTournament();
    unsubscribeBtn.className = "unsubscribe-btn tournament-btn";
    parent.appendChild(unsubscribeBtn);
}

export function createWaitingScreenTournament(tournament) {
    if (!tournament)
        return;
    if (!document.getElementsByClassName("tournament")[0])
        createTournamentDiv();
    document.getElementById("backIcon")?.remove();
    document.getElementById("actualizeIcon")?.remove();
    const tournamentDiv = document.getElementsByClassName("tournament")[0];
    tournamentDiv.innerHTML = `<h1>${tournament.name}</h1>`;
    tournamentDiv.id = "PlayerList";
	const header = document.createElement("div");
	header.className = "list-header";
	header.setAttribute("data-lang", "players");
    const playerList = document.createElement("div");
    playerList.className = "player-list";
    playerList.id = "player-list";
    createUnsubscribeButton(tournamentDiv);
	tournamentDiv.appendChild(header);
    tournamentDiv.appendChild(playerList);
}

export function insertPlayer(player) {
	const div = document.createElement("div");
    const playerList = document.getElementById("player-list");
	div.textContent = player;
    playerList?.appendChild(div);
}