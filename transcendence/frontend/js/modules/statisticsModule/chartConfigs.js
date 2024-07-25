import { getKeyTranslation } from "../translationsModule/translationsModule.js";

async function winRateChartConfig(userStats) {
	return {
		type: 'pie',
		data: {
			labels: [await getKeyTranslation("wins"), await getKeyTranslation("losses")],
			datasets: [{
				label: await getKeyTranslation("winrate_chart"),
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
							return " " + tooltipItem.raw;
						}
					}
				}
			}
		}
	}
}

async function goalAverageChartConfig(userStats) {
	return {

		type: 'pie',
		data: {
			labels: [await getKeyTranslation("scored"), await getKeyTranslation("conceded")],
			datasets: [{
				label: await getKeyTranslation("goal_average_chart"),
				data: [userStats.averageScored, userStats.averageConceded],
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
							return " " + tooltipItem.raw;
						}
					}
				}
			}
		}
	}
}

async function exchangeChartConfig(userStats) {
	return {
		type: 'bar',
		data: {
			labels: [await getKeyTranslation("exchange_before_goal")],
			datasets: [{
				label: await getKeyTranslation("exchanges_chart"),
				data: [userStats.averageExchanged],
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
			scales: {
				y: {
					beginAtZero: true,
					min: 0,
					max: 20
				}
			},
			plugins: {
				legend: {
					position: 'top',
				},
				tooltip: {
					callbacks: {
						label: function (tooltipItem) {
							return " " + tooltipItem.raw;
						}
					}
				}
			}
		}
	}
}

export { winRateChartConfig, goalAverageChartConfig, exchangeChartConfig };