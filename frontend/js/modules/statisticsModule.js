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
		return ;
	const userStats = {
		winrate: await runEndPoint("stats/" + username + "/winrate", "GET"),
		wins: await runEndPoint("stats/" + username + "/matchs/win", "GET"),
		losses: await runEndPoint("stats/" + username + "/matchs/loose", "GET"),
		winstreak: await runEndPoint("stats/" + username + "/matchs/win/streak", "GET"),
		matchHistory: [
			{ opponent: 'User1', score: '5-3' },
			{ opponent: 'User2', score: '4-5' },
			{ opponent: 'User3', score: '6-2' },
			// Add more match data here
		]
	};

	updateStatistics();

	function updateStatistics() {
		module.querySelector('#winrate').innerText = `${userStats.winrate}%`;
		module.querySelector('#wins').innerText = userStats.wins;
		module.querySelector('#losses').innerText = userStats.losses;
		module.querySelector('#winstreak').innerText = userStats.winstreak;

		const matchHistoryTable = module.querySelector('#match-history').getElementsByTagName('tbody')[0];
		matchHistoryTable.innerHTML = '';

		userStats.matchHistory.forEach(match => {
		  const row = matchHistoryTable.insertRow();
		  const cellOpponent = row.insertCell(0);
		  const cellScore = row.insertCell(1);
	  
		  cellOpponent.innerText = match.opponent;
		  cellScore.innerText = match.score;
		});
	  
		// Initialize the Chart.js chart
		const ctx = document.getElementById('winLossChart').getContext('2d');
		new Chart(ctx, {
		  type: 'bar',
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
			scales: {
			  y: {
				beginAtZero: true
			  }
			}
		  }
		});
	  }
}