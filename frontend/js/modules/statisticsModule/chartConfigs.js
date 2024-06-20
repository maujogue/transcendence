
function winRateChartConfig(userStats) {
	return {
		type: 'pie',
		data: {
			labels: ['Wins', 'Losses'],
			datasets: [{
				label: 'winLoseChart',
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

function goalAverageChartConfig(userStats) {
	return {

		type: 'pie',
		data: {
			labels: ['Scored', 'Conceded'],
			datasets: [{
				label: 'goalAverageChart',
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

function exchangeChartConfig(userStats) {
	return {
		type: 'bar',
		data: {
			labels: ['Exchanges Before Goal'],
			datasets: [{
				label: 'ExchangesChart',
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