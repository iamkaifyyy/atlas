import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Address,
  type Hex
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';

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

export class ContractClient {
  public publicClient: ReturnType<typeof createPublicClient>;
  public walletClient: ReturnType<typeof createWalletClient>;
  public agentAccount: ReturnType<typeof privateKeyToAccount>;
  public vaultAddress: Address | null = null;
  public rpcUrl: string;

  public ownerAccount: ReturnType<typeof privateKeyToAccount>;

  constructor(
    vaultAddress?: string,
    rpcUrl: string = process.env.RPC_URL || 'http://127.0.0.1:8545',
    agentPrivateKey: Hex = (process.env.AGENT_PRIVATE_KEY as Hex) ||
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    ownerPrivateKey: Hex = (process.env.OWNER_PRIVATE_KEY as Hex) ||
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  ) {
    this.rpcUrl = rpcUrl;
    this.agentAccount = privateKeyToAccount(agentPrivateKey);
    this.ownerAccount = privateKeyToAccount(ownerPrivateKey);
    this.vaultAddress = (vaultAddress as Address) || (process.env.VAULT_ADDRESS as Address) || null;

    this.publicClient = createPublicClient({
      chain: localhost,
      transport: http(this.rpcUrl)
    });

    this.walletClient = createWalletClient({
      chain: localhost,
      transport: http(this.rpcUrl)
    });
  }

  public setVaultAddress(address: string): void {
    this.vaultAddress = address as Address;
  }

  public async getVaultState() {
    if (!this.vaultAddress) return null;
    try {
      const data = await this.publicClient.readContract({
        address: this.vaultAddress,
        abi: AGENT_VAULT_ABI,
        functionName: 'getVaultState'
      });
      return {
        killed: data[0],
        balanceEth: formatEther(data[1]),
        spentEth: formatEther(data[2]),
        totalCapEth: formatEther(data[3]),
        perTradeCapEth: formatEther(data[4]),
        thresholdEth: formatEther(data[5]),
        agent: data[6],
        owner: data[7]
      };
    } catch (err) {
      console.warn('[ContractClient] Could not read vault state:', (err as Error).message);
      return null;
    }
  }

  public async submitTrade(amountEth: number, priceUsd: number, recipient?: string) {
    if (!this.vaultAddress) {
      throw new Error('Vault address not set in contract client');
    }

    const targetRecipient = (recipient as Address) || this.agentAccount.address;
    const amountWei = parseEther(amountEth.toString());
    const priceScaled = BigInt(Math.round(priceUsd * 100));

    const hash = await this.walletClient.writeContract({
      address: this.vaultAddress,
      abi: AGENT_VAULT_ABI,
      functionName: 'executeTrade',
      args: [amountWei, priceScaled, targetRecipient, '0x'],
      account: this.agentAccount,
      chain: localhost
    });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    return { hash, receipt };
  }

  public async approveTrade(tradeId: number | string) {
    if (!this.vaultAddress) throw new Error('Vault address not set');
    const hash = await this.walletClient.writeContract({
      address: this.vaultAddress,
      abi: AGENT_VAULT_ABI,
      functionName: 'approveTrade',
      args: [BigInt(tradeId)],
      account: this.ownerAccount,
      chain: localhost
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    return { hash, receipt };
  }

  public async killSwitch() {
    if (!this.vaultAddress) throw new Error('Vault address not set');
    const hash = await this.walletClient.writeContract({
      address: this.vaultAddress,
      abi: AGENT_VAULT_ABI,
      functionName: 'killSwitch',
      account: this.ownerAccount,
      chain: localhost
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    return { hash, receipt };
  }
}
