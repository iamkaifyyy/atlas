// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentVault.sol";

contract KillSwitchTest is Test {
    AgentVault public vault;
    address public owner = address(0xABCD);
    address public agent = address(0x1234);
    address public stranger = address(0x9999);
    address public dex = address(0x5555);

    uint256 public constant TOTAL_CAP = 10 ether;
    uint256 public constant PER_TRADE_CAP = 2 ether;
    uint256 public constant APPROVAL_THRESHOLD = 1 ether;
    uint256 public constant INITIAL_ESCROW = 5 ether;

    event KillSwitchTriggered(address indexed owner, uint256 refundedAmount, uint256 timestamp);

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(stranger, 5 ether);

        vm.prank(owner);
        vault = new AgentVault{value: INITIAL_ESCROW}(
            agent,
            TOTAL_CAP,
            PER_TRADE_CAP,
            APPROVAL_THRESHOLD
        );
    }

    function test_NonOwnerCannotTriggerKillSwitch() public {
        vm.prank(stranger);
        vm.expectRevert(AgentVault.OnlyOwner.selector);
        vault.killSwitch();

        assertFalse(vault.isKilled());
    }

    function test_KillSwitchRefundsOwnerAndHaltsOperations() public {
        uint256 ownerBalBefore = owner.balance;
        uint256 vaultBalBefore = address(vault).balance;
        assertEq(vaultBalBefore, INITIAL_ESCROW);

        vm.expectEmit(true, false, false, true);
        emit KillSwitchTriggered(owner, INITIAL_ESCROW, block.timestamp);

        vm.prank(owner);
        vault.killSwitch();

        assertTrue(vault.isKilled());
        assertEq(address(vault).balance, 0);
        assertEq(owner.balance, ownerBalBefore + INITIAL_ESCROW);

        // Attempting trade after kill switch should revert
        vm.prank(agent);
        vm.expectRevert(AgentVault.VaultKilled.selector);
        vault.executeTrade(0.5 ether, 3000, dex, "");
    }

    function test_KillSwitchBlocksPendingTradeApproval() public {
        // Queue a trade
        vm.prank(agent);
        (, uint256 tradeId) = vault.executeTrade(1.5 ether, 3000, dex, "");
        assertEq(tradeId, 1);

        // Owner kills vault
        vm.prank(owner);
        vault.killSwitch();

        // Attempting to approve after kill switch reverts
        vm.prank(owner);
        vm.expectRevert(AgentVault.VaultKilled.selector);
        vault.approveTrade(tradeId);
    }
}
