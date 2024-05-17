export function getTournamentBracket() {
    console.log("getTournamentBracket");
    const url = `./js/pong/dev/bracket.json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            createBracket(data);
        });
}

function createBracket(data) {
    console.log(data);
    const tournament = data.tournament;
    const bracket = document.createElement("div");
    bracket.className = "bracket";
    const rounds = tournament.rounds;
    rounds.map((round) => {
        console.log(round);
        const roundDiv = document.createElement("div");
        roundDiv.className = "round";
        const roundName = document.createElement("div");
        roundName.className = "round-name";
        roundName.textContent = round.name;
        roundDiv.appendChild(roundName);
        round.matches.map((match) => {
            const matchDiv = document.createElement("div");
            matchDiv.className = "match";
            
            createPlayerDiv(matchDiv, match.player1, match.player1_score, match.winner === match.player1);
            createPlayerDiv(matchDiv, match.player2, match.player2_score, match.winner === match.player2);
            roundDiv.appendChild(matchDiv);
        });
        bracket.appendChild(roundDiv);
    });
    document.getElementById("testBracket").appendChild(bracket);
}

function createPlayerDiv(parent, playerName, score, isWinner) {
    const playerDiv = document.createElement("div");
    playerDiv.className = "bracket-player";
    playerDiv.textContent = playerName;
    const scoreDiv = document.createElement("div");
    scoreDiv.textContent = score;
    if (isWinner)
        playerDiv.style.fontWeight = "bold";
    parent.appendChild(playerDiv);
    playerDiv.appendChild(scoreDiv);
}