// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AgentVault.sol";
import "../src/MockPriceFeed.sol";

contract DeployScript is Script {
    function run() external returns (MockPriceFeed priceFeed, AgentVault vault) {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80) // default anvil key 0
        );

        address agentAddress = vm.envOr(
            "AGENT_ADDRESS",
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8) // default anvil key 1
        );

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockPriceFeed initialized to ETH @ $3,000 (8 decimals like Chainlink)
        priceFeed = new MockPriceFeed(3000 * 1e8, 8);

        // 2. Deploy AgentVault with 10 ETH escrow, 5 ETH max total cap, 2 ETH max per trade, 0.5 ETH approval threshold
        vault = new AgentVault{value: 5 ether}(
            agentAddress,
            5 ether,      // Max Total Spend
            1.5 ether,    // Max Per Trade Spend
            0.5 ether     // Approval Threshold
        );

        vm.stopBroadcast();

        console.log("MockPriceFeed deployed at:", address(priceFeed));
        console.log("AgentVault deployed at:", address(vault));
        console.log("Vault Owner:", vault.owner());
        console.log("Agent Address:", vault.agent());
        console.log("Escrow Balance:", address(vault).balance);
    }
}
