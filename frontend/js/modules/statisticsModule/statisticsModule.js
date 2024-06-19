import { getModuleDiv } from "../../Modules.js";
import { runEndPoint } from "../../ApiUtils.js";
import { getUserData } from "../../User.js";
import { CustomChart } from "./CustomChart.js";
import { winRateChartConfig, goalAverageChartConfig, exchangeChartConfig } from "./chartConfigs.js";

export async function init() {
	var module = getModuleDiv("statisticsModule");
	if (!module)
		return;

	var usernameDiv = module.parentElement.querySelector(".usernameDynamic");
	var username;
	if (usernameDiv && usernameDiv.innerText.length > 0)
		username = usernameDiv.innerText;
	else
		username = await getUserData("username");
	console.log(username);
	if (!username)
		return;
	var response = await runEndPoint("stats/" + username + "/matchs", "GET");
	if (response.statusCode == 200)
		var matchs = response.data.matchs;
	if (matchs.length == 0) {
		module.querySelector("#gamesPlayedRow").innerHTML = '<span class="fs-5">Play your first match to see your statistics here! </span>';
		return;
	}
	response = await runEndPoint("stats/" + username + "/winrate", "GET");
	if (response.statusCode == 200)
		var winrate = response.data.winrate;
	response = await runEndPoint("stats/" + username + "/matchs/win", "GET");
	if (response.statusCode == 200)
		var wins = response.data.matchs;
	response = await runEndPoint("stats/" + username + "/matchs/loose", "GET");
	if (response.statusCode == 200)
		var losses = response.data.matchs;
	response = await runEndPoint("stats/" + username + "/matchs/win/streak", "GET");
	if (response.statusCode == 200)
		var winstreak = response.data.win_streak;
	response = await runEndPoint("stats/" + username + "/average-exchange-before-goal", "GET");
	if (response.statusCode == 200)
		var averageExchanged = response.data.average_exchange_before_goal;
	response = await runEndPoint("stats/" + username + "/average-scored-per-match", "GET");
	if (response.statusCode == 200) {
		var averageScored = response.data.average_scored_per_match;
		var averageConceded = response.data.average_conceded_per_match;
	}

	const userStats = {
		winrate: winrate,
		wins: wins.length,
		losses: losses.length,
		winstreak: winstreak,
		matchHistoryAll: matchs,
		matchHistoryWins: wins,
		matchHistoryLosses: losses,
		averageScored: averageScored,
		averageConceded: averageConceded,
		averageExchanged: averageExchanged,
	};

	module.querySelector('#winrate').innerText = `${userStats.winrate}%`;
	module.querySelector('#wins').innerText = userStats.wins;
	module.querySelector('#losses').innerText = userStats.losses;
	module.querySelector('#winstreak').innerText = userStats.winstreak;
	updateMatchHistory(userStats.matchHistoryAll);

	var charts = [
		new CustomChart(module, '#winRateChart', '.winrate-dropdown', winRateChartConfig(userStats)),
		new CustomChart(module, '#goalAverageChart', '.goal-dropdown', goalAverageChartConfig(userStats)),
		new CustomChart(module, '#exchangeChart', '.exchange-dropdown', exchangeChartConfig(userStats)),
	];

	var historyDropdown = module.querySelector('.history-dropdown');
	historyDropdown.querySelectorAll('.dropdown-item').forEach(item => {
		item.addEventListener('click', function () {
			historyDropdown.querySelectorAll('[data-filter]').forEach(element => element.hidden = false);
			const button = historyDropdown.querySelector('button');
			const filter = this.getAttribute('data-filter');
			var elementToHide = module.querySelector('[data-filter="' + filter + '"]');
			if (filter === 'all') {
				updateMatchHistory(userStats.matchHistoryAll);
			} else if (filter === 'wins') {
				updateMatchHistory(userStats.matchHistoryWins);
			} else if (filter === 'losses') {
				updateMatchHistory(userStats.matchHistoryLosses);
			}
			button.textContent = filter;
			elementToHide.hidden = true;

		});
	});

	function updateMatchHistory(matches) {
		const matchHistoryTable = module.querySelector('#match-history').getElementsByTagName('tbody')[0];
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