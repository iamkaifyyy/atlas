// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentVault.sol";

contract ApprovalFlowTest is Test {
    AgentVault public vault;
    address public owner = address(0xABCD);
    address public agent = address(0x1234);
    address public dex = address(0x5555);

    uint256 public constant TOTAL_CAP = 10 ether;
    uint256 public constant PER_TRADE_CAP = 5 ether;
    uint256 public constant APPROVAL_THRESHOLD = 1 ether; // Trades > 1 ether require approval
    uint256 public constant INITIAL_ESCROW = 10 ether;

    event TradePendingApproval(uint256 indexed tradeId, uint256 amount, uint256 price, address recipient, uint256 timestamp);
    event TradeApproved(uint256 indexed tradeId, uint256 amount, uint256 price, uint256 timestamp);
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

    function test_TradeAboveThresholdQueuesForApproval() public {
        uint256 tradeAmount = 2.5 ether; // > 1 ether, <= 5 ether
        uint256 price = 3200;

        vm.expectEmit(true, false, false, true);
        emit TradePendingApproval(1, tradeAmount, price, dex, block.timestamp);

        vm.prank(agent);
        (bool executed, uint256 tradeId) = vault.executeTrade(tradeAmount, price, dex, "");

        assertFalse(executed);
        assertEq(tradeId, 1);
        assertEq(vault.totalSpent(), 0); // Not spent yet

        (
            uint256 id,
            uint256 amt,
            uint256 prc,
            address rec,
            ,
            bool isExec,
            bool isRej,
            
        ) = vault.pendingTrades(1);

        assertEq(id, 1);
        assertEq(amt, tradeAmount);
        assertEq(prc, price);
        assertEq(rec, dex);
        assertFalse(isExec);
        assertFalse(isRej);
    }

    function test_OwnerApprovesPendingTrade() public {
        uint256 tradeAmount = 2.5 ether;
        uint256 price = 3200;

        vm.prank(agent);
        (, uint256 tradeId) = vault.executeTrade(tradeAmount, price, dex, "");

        uint256 dexBalBefore = dex.balance;

        vm.expectEmit(true, false, false, true);
        emit TradeApproved(tradeId, tradeAmount, price, block.timestamp);
        vm.expectEmit(true, false, false, true);
        emit TradeExecuted(tradeId, tradeAmount, price, dex, block.timestamp);

        vm.prank(owner);
        vault.approveTrade(tradeId);

        assertEq(vault.totalSpent(), tradeAmount);
        assertEq(dex.balance, dexBalBefore + tradeAmount);
        assertEq(address(vault).balance, INITIAL_ESCROW - tradeAmount);

        // Cannot re-approve
        vm.prank(owner);
        vm.expectRevert(AgentVault.TradeAlreadyProcessed.selector);
        vault.approveTrade(tradeId);
    }

    function test_NonOwnerCannotApprove() public {
        vm.prank(agent);
        (, uint256 tradeId) = vault.executeTrade(2.5 ether, 3200, dex, "");

        vm.prank(agent);
        vm.expectRevert(AgentVault.OnlyOwner.selector);
        vault.approveTrade(tradeId);
    }

    function test_OwnerRejectsPendingTrade() public {
        vm.prank(agent);
        (, uint256 tradeId) = vault.executeTrade(2.5 ether, 3200, dex, "");

        vm.expectEmit(false, false, false, true);
        emit TradeRejected("Manual risk threshold review failed", 2.5 ether, 3200, block.timestamp);

        vm.prank(owner);
        vault.rejectTrade(tradeId, "Manual risk threshold review failed");

        assertEq(vault.totalSpent(), 0);
        assertEq(address(vault).balance, INITIAL_ESCROW);

        // Cannot approve after rejection
        vm.prank(owner);
        vm.expectRevert(AgentVault.TradeAlreadyProcessed.selector);
        vault.approveTrade(tradeId);
    }
}
