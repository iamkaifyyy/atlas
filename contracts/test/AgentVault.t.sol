// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentVault.sol";

contract AgentVaultTest is Test {
    AgentVault public vault;
    address public owner = address(0xABCD);
    address public agent = address(0x1234);
    address public stranger = address(0x9999);
    address public dex = address(0x5555);

    uint256 public constant TOTAL_CAP = 10 ether;
    uint256 public constant PER_TRADE_CAP = 2 ether;
    uint256 public constant APPROVAL_THRESHOLD = 1 ether;
    uint256 public constant INITIAL_ESCROW = 5 ether;

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(agent, 10 ether);
        vm.deal(stranger, 10 ether);

        vm.prank(owner);
        vault = new AgentVault{value: INITIAL_ESCROW}(
            agent,
            TOTAL_CAP,
            PER_TRADE_CAP,
            APPROVAL_THRESHOLD
        );
    }

    function test_InitialState() public view {
        assertEq(vault.owner(), owner);
        assertEq(vault.agent(), agent);
        assertEq(vault.maxTotalSpend(), TOTAL_CAP);
        assertEq(vault.maxPerTradeSpend(), PER_TRADE_CAP);
        assertEq(vault.approvalThreshold(), APPROVAL_THRESHOLD);
        assertEq(address(vault).balance, INITIAL_ESCROW);
        assertEq(vault.totalSpent(), 0);
        assertFalse(vault.isKilled());
    }

    function test_DepositMoreFunds() public {
        vm.prank(owner);
        (bool sent, ) = address(vault).call{value: 2 ether}("");
        assertTrue(sent);
        assertEq(address(vault).balance, INITIAL_ESCROW + 2 ether);
    }

    function test_SetAgentOnlyOwner() public {
        address newAgent = address(0x8888);
        vm.prank(owner);
        vault.setAgent(newAgent);
        assertEq(vault.agent(), newAgent);

        vm.prank(stranger);
        vm.expectRevert(AgentVault.OnlyOwner.selector);
        vault.setAgent(address(0x7777));
    }

    function test_SetCapsOnlyOwner() public {
        vm.prank(owner);
        vault.setCaps(20 ether, 4 ether, 2 ether);
        assertEq(vault.maxTotalSpend(), 20 ether);
        assertEq(vault.maxPerTradeSpend(), 4 ether);
        assertEq(vault.approvalThreshold(), 2 ether);

        vm.prank(stranger);
        vm.expectRevert(AgentVault.OnlyOwner.selector);
        vault.setCaps(50 ether, 10 ether, 5 ether);
    }

    function test_UnauthorizedCallerCannotExecute() public {
        vm.prank(stranger);
        vm.expectRevert(AgentVault.OnlyAgentOrOwner.selector);
        vault.executeTrade(0.5 ether, 3000, dex, "");
    }
}
