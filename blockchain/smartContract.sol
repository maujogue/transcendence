// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract StoreTournamentsScore {
    address owner;
    string public message;

    constructor() {
        owner = msg.sender;
        message = "No communication";
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You're not the owner.");
        _;
    }

    function setMessage(string calldata newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}

//do a map of matches in a map of tournaments ?