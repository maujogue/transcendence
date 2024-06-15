// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract StoreTournamentsData {
	address owner;
		
	struct Match {
		string id;
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
		string calldata _id,
		string calldata _round,
		string calldata _player1,
		string calldata _scorePlayer1,
		string calldata _player2,
		string calldata _scorePlayer2,
		string calldata _matchWinner
	) public onlyOwner {
		matches.push(Match(
			_id,
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
		string memory _matchId,
		string memory _round,
		string memory _player1,
		string memory _scorePlayer1,
		string memory _player2,
		string memory _scorePlayer2,
		string memory _matchWinner
	) {
		for (uint i  = 0; i < matches.length; i++) {
			if (keccak256(abi.encodePacked(matches[i].id)) == keccak256(abi.encodePacked(_id))) {
				return (
					matches[i].id,
					matches[i].round,
					matches[i].player1,
					matches[i].scorePlayer1,
					matches[i].player2,
					matches[i].scorePlayer2,
					matches[i].matchWinner
				);
			}
		}
		revert("Match not found");
	}
}
