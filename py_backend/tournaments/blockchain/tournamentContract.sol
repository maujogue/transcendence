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

	constructor(string memory _tournamentName) {
		owner = msg.sender;
		tournamentName = _tournamentName;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "You're not the owner.");
		_;
	}

	function addMatchesAndWinner(
		string calldata _tournamentWinner, Match[] calldata _matches) public onlyOwner {
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

// 	function getMatchesByPlayer(string memory playerName) public view returns(Match[] memory) {
// 		Match[] memory playerMatches;

// 		for (uint i = 0; i < matches.length; i++) {
// 			if ((keccak256(abi.encodePacked(matches[i].player1)) == keccak256(abi.encodePacked(playerName)))
// 				|| (keccak256(abi.encodePacked(matches[i].player2)) == keccak256(abi.encodePacked(playerName)))) {
// 					Match memory tempMatch = Match(matches[i].round,
// 													matches[i].player1,
// 													matches[i].scorePlayer1,
// 													matches[i].player2,
// 													matches[i].scorePlayer2,
// 													matches[i].matchWinner);			
// 					playerMatches.push(tempMatch);
// 				}
// 		}
// 		return playerMatches;
// 	}
}