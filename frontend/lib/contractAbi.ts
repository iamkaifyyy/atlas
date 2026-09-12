export const AGENT_VAULT_ABI = [
  {
    type: 'constructor',
    inputs: [
      { name: '_agent', type: 'address' },
      { name: '_maxTotalSpend', type: 'uint256' },
      { name: '_maxPerTradeSpend', type: 'uint256' },
      { name: '_approvalThreshold', type: 'uint256' }
    ],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'agent',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'isKilled',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'maxTotalSpend',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'maxPerTradeSpend',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'approvalThreshold',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSpent',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'executeTrade',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'data', type: 'bytes' }
    ],
    outputs: [
      { name: 'executed', type: 'bool' },
      { name: 'tradeId', type: 'uint256' }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'approveTrade',
    inputs: [{ name: 'tradeId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'rejectTrade',
    inputs: [
      { name: 'tradeId', type: 'uint256' },
      { name: 'reason', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'killSwitch',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getVaultState',
    inputs: [],
    outputs: [
      { name: 'killed', type: 'bool' },
      { name: 'balance', type: 'uint256' },
      { name: 'spent', type: 'uint256' },
      { name: 'totalCap', type: 'uint256' },
      { name: 'perTradeCap', type: 'uint256' },
      { name: 'threshold', type: 'uint256' },
      { name: 'agentAddress', type: 'address' },
      { name: 'ownerAddress', type: 'address' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'TradeAttempted',
    inputs: [
      { name: 'caller', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'TradeExecuted',
    inputs: [
      { name: 'tradeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'recipient', type: 'address', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'TradePendingApproval',
    inputs: [
      { name: 'tradeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'recipient', type: 'address', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'TradeApproved',
    inputs: [
      { name: 'tradeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'TradeRejected',
    inputs: [
      { name: 'reason', type: 'string', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'KillSwitchTriggered',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'refundedAmount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  }
] as const;
