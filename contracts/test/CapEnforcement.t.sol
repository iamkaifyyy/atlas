// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentVault.sol";

contract CapEnforcementTest is Test {
    AgentVault public vault;
    address public owner = address(0xABCD);
    address public agent = address(0x1234);
    address public dex = address(0x5555);

    uint256 public constant TOTAL_CAP = 3 ether;
    uint256 public constant PER_TRADE_CAP = 1 ether;
    uint256 public constant APPROVAL_THRESHOLD = 1 ether; // Any trade <= 1 ether executes directly
    uint256 public constant INITIAL_ESCROW = 10 ether;

    event TradeExecuted(uint256 indexed tradeId, uint256 amount, uint256 price, address recipient, uint256 timestamp);
    event TradeRejected(string reason, uint256 amount, uint256 price, uint256 timestamp);

    function setUp() public {
        vm.deal(owner, 50 ether);
        vm.prank(owner);
        vault = new AgentVault{value: INITIAL_ESCROW}(
            agent,
            TOTAL_CAP,
            PER_TRADE_CAP,
            APPROVAL_THRESHOLD
        );
    }

    function test_DirectTradeWithinCapsSucceeds() public {
        uint256 tradeAmount = 0.5 ether;
        uint256 price = 3100;

        vm.prank(agent);
        (bool executed, uint256 tradeId) = vault.executeTrade(tradeAmount, price, dex, "");

        assertTrue(executed);
        assertEq(tradeId, 0);
        assertEq(vault.totalSpent(), tradeAmount);
        assertEq(address(vault).balance, INITIAL_ESCROW - tradeAmount);
        assertEq(dex.balance, tradeAmount);
    }

    function test_ExceedPerTradeCapRejection() public {
        uint256 tradeAmount = 1.5 ether; // > PER_TRADE_CAP (1 ether)
        uint256 price = 3100;

        vm.expectEmit(false, false, false, true);
        emit TradeRejected("Exceeds max per-trade spend cap", tradeAmount, price, block.timestamp);

        vm.prank(agent);
        (bool executed, uint256 tradeId) = vault.executeTrade(tradeAmount, price, dex, "");

        assertFalse(executed);
        assertEq(tradeId, 0);
        assertEq(vault.totalSpent(), 0);
        assertEq(address(vault).balance, INITIAL_ESCROW);
    }

    function test_ExceedTotalCumulativeCapRejection() public {
        // First trade: 1.0 ether (allowed)
        vm.prank(agent);
        (bool exec1, ) = vault.executeTrade(1.0 ether, 3000, dex, "");
        assertTrue(exec1);

        // Second trade: 1.0 ether (allowed)
        vm.prank(agent);
        (bool exec2, ) = vault.executeTrade(1.0 ether, 3000, dex, "");
        assertTrue(exec2);

        // Third trade: 1.0 ether (allowed, totalSpent becomes 3.0 ether = TOTAL_CAP)
        vm.prank(agent);
        (bool exec3, ) = vault.executeTrade(1.0 ether, 3000, dex, "");
        assertTrue(exec3);
        assertEq(vault.totalSpent(), 3.0 ether);

        // Fourth trade: 0.5 ether -> should exceed total cap (3.0 + 0.5 > 3.0)
        vm.expectEmit(false, false, false, true);
        emit TradeRejected("Exceeds lifetime total spend cap", 0.5 ether, 3000, block.timestamp);

        vm.prank(agent);
        (bool exec4, uint256 tradeId) = vault.executeTrade(0.5 ether, 3000, dex, "");
        assertFalse(exec4);
        assertEq(tradeId, 0);
        assertEq(vault.totalSpent(), 3.0 ether); // Unchanged
    }

    function test_InsufficientVaultBalanceRejection() public {
        // Drain vault to 0.2 ether
        vm.prank(owner);
        vault.setCaps(20 ether, 20 ether, 20 ether);

        // Execute trade of 9.8 ether
        vm.prank(agent);
        vault.executeTrade(9.8 ether, 3000, dex, "");
        assertEq(address(vault).balance, 0.2 ether);

        // Next trade of 0.5 ether should fail due to escrow balance
        vm.expectEmit(false, false, false, true);
        emit TradeRejected("Insufficient vault escrow balance", 0.5 ether, 3000, block.timestamp);

        vm.prank(agent);
        (bool executed, ) = vault.executeTrade(0.5 ether, 3000, dex, "");
        assertFalse(executed);
    }
}
