// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract StoreTournamentData {
	address owner;
		
	struct Match {
		string matchId;
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

	function addMatch(
		string calldata _matchId,
		string calldata _round,
		string calldata _player1,
		string calldata _scorePlayer1,
		string calldata _player2,
		string calldata _scorePlayer2,
		string calldata _matchWinner
	) public onlyOwner {
		matches.push(Match(
			_matchId,
			_round,
			_player1,
			_scorePlayer1,
			_player2,
			_scorePlayer2,
			_matchWinner
		));
	}

	function setTournamentWinner(string calldata _tournamentWinner) public onlyOwner {
		tournamentWinner = _tournamentWinner;
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

	function getMatch(string memory _id) public view returns (
		string memory,
		string memory,
		string memory,
		string memory,
		string memory,
		string memory,
		string memory
	) {
		for (uint i  = 0; i < matches.length; i++) {
			if (keccak256(abi.encodePacked(matches[i].matchId)) == keccak256(abi.encodePacked(_id))) {
				Match storage match_ = matches[i];
				return (
					match_.matchId,
					match_.round,
					match_.player1,
					match_.scorePlayer1,
					match_.player2,
					match_.scorePlayer2,
					match_.matchWinner
				);
			}
		}
		revert("Match not found");
	}
}
