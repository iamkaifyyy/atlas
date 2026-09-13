// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AgentVault.sol";
import "../src/MockPriceFeed.sol";

contract DeployScript is Script {
    function run()
        external
        returns (MockPriceFeed priceFeed, AgentVault vault)
    {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );

        // Get agent address from environment
        address agentAddress = vm.envOr(
            "AGENT_ADDRESS",
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
        );

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockPriceFeed
        // ETH price = $3,000
        // 8 decimals, similar to Chainlink
        priceFeed = new MockPriceFeed(
            3000 * 1e8,
            8
        );

        // 2. Deploy AgentVault
        // Send 0.1 ETH to the vault as initial escrow
        //
        // 5 ETH     = Maximum total spend
        // 1.5 ETH   = Maximum per trade
        // 0.5 ETH   = Approval threshold
        vault = new AgentVault{value: 0.1 ether}(
            agentAddress,
            5 ether,
            1.5 ether,
            0.5 ether
        );

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Print deployment information
        console.log(
            "MockPriceFeed deployed at:",
            address(priceFeed)
        );

        console.log(
            "AgentVault deployed at:",
            address(vault)
        );

        console.log(
            "Vault Owner:",
            vault.owner()
        );

        console.log(
            "Agent Address:",
            vault.agent()
        );

        console.log(
            "Escrow Balance:",
            address(vault).balance
        );
    }
}