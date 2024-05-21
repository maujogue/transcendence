import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js";
import { getUserData } from "../User.js";

export async function init() {
	var module = getModuleDiv("statisticsModule");
	if (!module)
		return;

	// Example data, replace this with actual data from your backend
	var username = await getUserData("username");
	const userStats = {
		winrate: await runEndPoint("stats/" + username + "/winrate"),
		wins: await runEndPoint("stats/" + username + "/matchs/win"),
		losses: await runEndPoint("stats/" + username + "/matchs/loose"),
		winstreak: await runEndPoint("stats/" + username + "/matchs/win/streak"),
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
	}
}