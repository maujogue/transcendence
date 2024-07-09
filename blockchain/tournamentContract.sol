// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract StoreTournamentData {

	address owner;
		
	struct Match {
		string round;
		string player1;
		string scorePlayer1;
		string player2;
		string scorePlayer2;
		string matchWinner;
	}

	string public tournamentName;
	string public tournamentWinner;
	Match[] public matches;

	constructor() {
		owner = msg.sender;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "You're not the owner.");
		_;
	}

	function addTournament(
			string calldata _tournamentName,
			string calldata _tournamentWinner,
			Match[] calldata _matches) public onlyOwner {
		tournamentName = _tournamentName;
		tournamentWinner = _tournamentWinner;
		for (uint i = 0; i < _matches.length; i++) {
			matches.push(_matches[i]);
		}
	}

	function getTournamentWinner() public view returns (string memory) {
		return tournamentWinner;
	}

	function getTournamentName() public view returns (string memory) {
		return tournamentName;
	}

	function getMatches() public view returns (Match[] memory) {
		return matches;
	}
}