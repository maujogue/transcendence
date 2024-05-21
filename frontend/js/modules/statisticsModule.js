import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js";
import { getUserData } from "../User.js";

export async function init() {
	var module = getModuleDiv("statisticsModule");
	if (!module)
		return;

	// Example data, replace this with actual data from your backend
	var username = await getUserData("username");
	if (!username)
		return;
	var response = await runEndPoint("stats/" + username + "/winrate", "GET");
	if (response.statusCode == 200)
		var winrate = response.data.winrate;
	response = await runEndPoint("stats/" + username + "/matchs/win", "GET");
	if (response.statusCode == 200)
		var wins = response.data.matchs;
	response = await runEndPoint("stats/" + username + "/matchs", "GET");
	if (response.statusCode == 200)
		var matchs = response.data.matchs;
	response = await runEndPoint("stats/" + username + "/matchs/loose", "GET");
	if (response.statusCode == 200)
		var losses = response.data.matchs;
	response = await runEndPoint("stats/" + username + "/matchs/win/streak", "GET");
	if (response.statusCode == 200)
		var winstreak = response.data.win_streak;
	console.log(matchs);
	const userStats = {
		winrate: winrate,
		wins: wins.length,
		losses: losses.length,
		winstreak: winstreak,
		matchHistory: matchs,
	};

	updateStatistics();

	function updateStatistics() {
		module.querySelector('#winrate').innerText = `${userStats.winrate}%`;
		module.querySelector('#wins').innerText = userStats.wins;
		module.querySelector('#losses').innerText = userStats.losses;
		module.querySelector('#winstreak').innerText = userStats.winstreak;

		updateMatchHistory(userStats.matchHistory);

	}

	let currentChartType = 'pie';

	function initializeChart(type) {
		const ctx = document.getElementById('winLossChart').getContext('2d');
		return new Chart(ctx, {
			type: type,
			data: {
				labels: ['Wins', 'Losses'],
				datasets: [{
					label: 'Match Results',
					data: [userStats.wins, userStats.losses],
					backgroundColor: [
						'rgba(75, 192, 192, 0.2)',
						'rgba(255, 99, 132, 0.2)'
					],
					borderColor: [
						'rgba(75, 192, 192, 1)',
						'rgba(255, 99, 132, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top',
					},
					tooltip: {
						callbacks: {
							label: function (tooltipItem) {
								return tooltipItem.label + ': ' + tooltipItem.raw;
							}
						}
					}
				}
			}
		});
	}
	let chart = initializeChart(currentChartType);

	document.getElementById('chartToggle').addEventListener('change', function () {
		currentChartType = this.checked ? 'bar' : 'pie';
		chart.destroy();
		chart = initializeChart(currentChartType);
	});

	function updateMatchHistory(matches) {
		const matchHistoryTable = document.getElementById('match-history').getElementsByTagName('tbody')[0];
		matchHistoryTable.innerHTML = '';

		matches.forEach(match => {
			const row = matchHistoryTable.insertRow();
			row.className = match.player1 === match.winner ? 'win-row' : 'loss-row';

			const cellDate = row.insertCell(0);
			const cellScore = row.insertCell(1);
			const cellResult = row.insertCell(2);

			cellResult.innerHTML = username === match.winner
				? '<i class="fas fa-trophy result-icon" style="color: #28a745;"></i>'
				: '<i class="fas fa-times result-icon" style="color: #dc3545;"></i>';
			if (username == match.player1)
				cellScore.innerHTML = '<span class="fs-5" >' + match.player1 + " " + match.player1_score + " - " + match.player2_score + " " + match.player2 + '</span>';
			else
				cellScore.innerHTML = '<span class="fs-5" >' + match.player2 + " " + match.player2_score + " - " + match.player1_score + " " + match.player1 + '</span>';

			cellDate.innerHTML = '<span class="fs-6" >' + new Date(match.date).toLocaleString() + '</span>';
		});
	}

}