// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CoinFlip is ReentrancyGuard {
    enum Side { None, Heads, Tails }

    address public player1;
    address public player2;

    uint256 public stakeAmount;
    Side public player1Choice;

    bool public gameStarted;

    event GameJoined(address indexed player, Side side);
    event GameResolved(address winner, uint256 amountWon);

    constructor() {
        gameStarted = false;
    }

    function joinGame(Side side) external payable nonReentrant {
        require(side == Side.Heads || side == Side.Tails, "Invalid side");
        require(msg.value > 0, "Stake required");

        if (!gameStarted) {
            player1 = msg.sender;
            stakeAmount = msg.value;
            player1Choice = side;
            gameStarted = true;
            emit GameJoined(player1, side);
        } else {
            require(msg.sender != player1, "Already joined");
            require(msg.value == stakeAmount, "Stake must match");
            player2 = msg.sender;

            // Pseudo randomness - not secure!
            uint256 result = uint256(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))
            ) % 2;

            address winner;
            if (
                (result == 0 && player1Choice == Side.Heads) ||
                (result == 1 && player1Choice == Side.Tails)
            ) {
                winner = player1;
            } else {
                winner = player2;
            }

            uint256 balance = address(this).balance;
            (bool sent, ) = payable(winner).call{value: balance}("");
            require(sent, "Failed to send Ether");

            emit GameResolved(winner, balance);

            // Reset game
            player1 = address(0);
            player2 = address(0);
            stakeAmount = 0;
            player1Choice = Side.None;
            gameStarted = false;
        }
    }

    receive() external payable {}
}
