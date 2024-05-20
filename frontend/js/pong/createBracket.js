let canvas;
let ctx;
const startX = 50;
const startY = 50;
const boxWidth = 150;
const boxHeight = 45;
let verticalSpacing = 20;
const horizontalSpacing = 200;

export function getTournamentBracket() {
    const url = `./js/pong/dev/bracket16.json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            drawBracket(data);
        });
}

function drawMatchBox(x, y, match) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeRect(x, y, boxWidth, boxHeight);
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    writePlayerName(x + 10, y + 20, match.player1, match.player1_score, match.winner);
    writePlayerName(x + 10, y + 40, match.player2, match.player2_score, match.winner);
}

function writePlayerName(x, y, playerName, score, winner) {
    if (winner === playerName)
        ctx.fillStyle = 'green';
    ctx.fillText(`${playerName}`, x, y);
    ctx.fillText(`${score}`, x + boxWidth - 25, y);
    ctx.fillStyle = 'black';
}

function drawConnectingLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const midX = (x1 + x2) / 2;
    ctx.lineTo(midX, y1);
    ctx.lineTo(midX, y2);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawBracket(data) {
    canvas = document.getElementById('tournamentCanvas');
    ctx = canvas.getContext('2d');
    ctx.font = '12px Arial';
    let prevRoundMatchesPosY = [];
    
    const rounds = data.tournament.rounds;
    
    const roundHeights = rounds.map(round => round.matches.length * (boxHeight + verticalSpacing));
    const maxRoundHeight = Math.max(...roundHeights);
    
    rounds.forEach((round, roundIndex) => {
        let matchesPosY = [];
        let indexMatchesPosY = 0;
        const roundX = startX + roundIndex * horizontalSpacing;

        round.matches.forEach((match, matchIndex) => {
            console.log("roundIndex: ", roundIndex, "matchIndex: ", matchIndex);
            let matchY;


            if (roundIndex === 0)
                matchY = startY + matchIndex * (boxHeight + verticalSpacing);
            else {
                verticalSpacing = prevRoundMatchesPosY[indexMatchesPosY + 1] - (prevRoundMatchesPosY[indexMatchesPosY] + boxHeight);
                const twoBoxHeight = (boxHeight * 2) + (verticalSpacing / 2);
                matchY = prevRoundMatchesPosY[indexMatchesPosY]  + (twoBoxHeight / 2);
                indexMatchesPosY += 2;
            }
            matchesPosY.push(matchY);

            drawMatchBox(roundX, matchY, match);

            if (roundIndex < rounds.length - 1) {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatchY = startY + (maxRoundHeight - roundHeights[roundIndex + 1]) / 2 + nextMatchIndex * (boxHeight + verticalSpacing); // Align the next round vertically
                const nextMatchYCenter = nextMatchY + boxHeight / 2;
                const matchYCenter = matchY + boxHeight / 2;

                drawConnectingLine(roundX + boxWidth, matchYCenter, roundX + horizontalSpacing, nextMatchYCenter);
            }
        });
        console.log("matchesPosY: ", matchesPosY);
        prevRoundMatchesPosY = matchesPosY;
    });
} 