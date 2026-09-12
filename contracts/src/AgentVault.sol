// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Escrow vault for trading agents.
 * Enforces per-trade limits, cumulative spending caps, and human approval gates directly on-chain.
 */
contract AgentVault {
    address public owner;
    address public agent;
    bool public isKilled;

    uint256 public maxTotalSpend;
    uint256 public maxPerTradeSpend;
    uint256 public approvalThreshold;
    uint256 public totalSpent;

    uint256 public nextTradeId = 1;
    bool private _locked;

    struct PendingTrade {
        uint256 id;
        uint256 amount;
        uint256 price;
        address recipient;
        bytes data;
        bool executed;
        bool rejected;
        uint256 createdAt;
    }

    mapping(uint256 => PendingTrade) public pendingTrades;

    event Deposited(address indexed sender, uint256 amount, uint256 timestamp);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event CapsUpdated(uint256 maxTotalSpend, uint256 maxPerTradeSpend, uint256 approvalThreshold);
    event TradeAttempted(address indexed caller, uint256 amount, uint256 price, uint256 timestamp);
    event TradeExecuted(uint256 indexed tradeId, uint256 amount, uint256 price, address recipient, uint256 timestamp);
    event TradePendingApproval(uint256 indexed tradeId, uint256 amount, uint256 price, address recipient, uint256 timestamp);
    event TradeApproved(uint256 indexed tradeId, uint256 amount, uint256 price, uint256 timestamp);
    event TradeRejected(string reason, uint256 amount, uint256 price, uint256 timestamp);
    event KillSwitchTriggered(address indexed owner, uint256 refundedAmount, uint256 timestamp);

    error OnlyOwner();
    error OnlyAgentOrOwner();
    error VaultKilled();
    error ReentrancyGuard();
    error InsufficientBalance();
    error TradeAlreadyProcessed();
    error TradeNotFound();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyAgentOrOwner() {
        if (msg.sender != agent && msg.sender != owner) revert OnlyAgentOrOwner();
        _;
    }

    modifier onlyActive() {
        if (isKilled) revert VaultKilled();
        _;
    }

    modifier nonReentrant() {
        if (_locked) revert ReentrancyGuard();
        _locked = true;
        _;
        _locked = false;
    }

    constructor(
        address _agent,
        uint256 _maxTotalSpend,
        uint256 _maxPerTradeSpend,
        uint256 _approvalThreshold
    ) payable {
        require(_agent != address(0), "zero address");
        owner = msg.sender;
        agent = _agent;
        maxTotalSpend = _maxTotalSpend;
        maxPerTradeSpend = _maxPerTradeSpend;
        approvalThreshold = _approvalThreshold;

        if (msg.value > 0) {
            emit Deposited(msg.sender, msg.value, block.timestamp);
        }
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function setAgent(address _newAgent) external onlyOwner {
        require(_newAgent != address(0), "zero address");
        address old = agent;
        agent = _newAgent;
        emit AgentUpdated(old, _newAgent);
    }

    function setCaps(
        uint256 _maxTotalSpend,
        uint256 _maxPerTradeSpend,
        uint256 _approvalThreshold
    ) external onlyOwner {
        maxTotalSpend = _maxTotalSpend;
        maxPerTradeSpend = _maxPerTradeSpend;
        approvalThreshold = _approvalThreshold;
        emit CapsUpdated(_maxTotalSpend, _maxPerTradeSpend, _approvalThreshold);
    }

    function executeTrade(
        uint256 amount,
        uint256 price,
        address recipient,
        bytes calldata data
    ) external onlyAgentOrOwner onlyActive nonReentrant returns (bool executed, uint256 tradeId) {
        emit TradeAttempted(msg.sender, amount, price, block.timestamp);

        if (address(this).balance < amount) {
            emit TradeRejected("Insufficient vault escrow balance", amount, price, block.timestamp);
            return (false, 0);
        }

        if (amount > maxPerTradeSpend) {
            emit TradeRejected("Exceeds max per-trade spend cap", amount, price, block.timestamp);
            return (false, 0);
        }

        if (totalSpent + amount > maxTotalSpend) {
            emit TradeRejected("Exceeds lifetime total spend cap", amount, price, block.timestamp);
            return (false, 0);
        }

        // Require manual approval for any trade exceeding the threshold
        if (amount > approvalThreshold) {
            uint256 id = nextTradeId++;
            pendingTrades[id] = PendingTrade({
                id: id,
                amount: amount,
                price: price,
                recipient: recipient,
                data: data,
                executed: false,
                rejected: false,
                createdAt: block.timestamp
            });
            emit TradePendingApproval(id, amount, price, recipient, block.timestamp);
            return (false, id);
        }

        // Within limits: execute trade directly
        totalSpent += amount;
        (bool success, ) = recipient.call{value: amount}(data);
        if (!success) revert TransferFailed();

        emit TradeExecuted(0, amount, price, recipient, block.timestamp);
        return (true, 0);
    }

    function approveTrade(uint256 tradeId) external onlyOwner onlyActive nonReentrant {
        PendingTrade storage trade = pendingTrades[tradeId];
        if (trade.id == 0) revert TradeNotFound();
        if (trade.executed || trade.rejected) revert TradeAlreadyProcessed();

        if (address(this).balance < trade.amount) {
            emit TradeRejected("Insufficient vault balance on approval", trade.amount, trade.price, block.timestamp);
            revert InsufficientBalance();
        }

        if (totalSpent + trade.amount > maxTotalSpend) {
            trade.rejected = true;
            emit TradeRejected("Total spend cap exceeded during approval", trade.amount, trade.price, block.timestamp);
            return;
        }

        trade.executed = true;
        totalSpent += trade.amount;

        (bool success, ) = trade.recipient.call{value: trade.amount}(trade.data);
        if (!success) revert TransferFailed();

        emit TradeApproved(tradeId, trade.amount, trade.price, block.timestamp);
        emit TradeExecuted(tradeId, trade.amount, trade.price, trade.recipient, block.timestamp);
    }

    function rejectTrade(uint256 tradeId, string calldata reason) external onlyOwner {
        PendingTrade storage trade = pendingTrades[tradeId];
        if (trade.id == 0) revert TradeNotFound();
        if (trade.executed || trade.rejected) revert TradeAlreadyProcessed();

        trade.rejected = true;
        emit TradeRejected(reason, trade.amount, trade.price, block.timestamp);
    }

    function killSwitch() external onlyOwner nonReentrant {
        isKilled = true;
        uint256 balance = address(this).balance;

        emit KillSwitchTriggered(owner, balance, block.timestamp);

        if (balance > 0) {
            (bool success, ) = owner.call{value: balance}("");
            if (!success) revert TransferFailed();
        }
    }

    function getVaultState()
        external
        view
        returns (
            bool killed,
            uint256 balance,
            uint256 spent,
            uint256 totalCap,
            uint256 perTradeCap,
            uint256 threshold,
            address agentAddress,
            address ownerAddress
        )
    {
        return (
            isKilled,
            address(this).balance,
            totalSpent,
            maxTotalSpend,
            maxPerTradeSpend,
            approvalThreshold,
            agent,
            owner
        );
    }
}
