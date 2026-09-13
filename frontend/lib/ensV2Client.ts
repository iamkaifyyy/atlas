export interface AgentEnsProfile {
  name: string;
  address: string;
  avatar?: string;
  strategy?: string;
  maxSpend?: string;
  version?: string;
  ensip26Verified: boolean;
  network: string;
}

export async function getAgentEnsProfile(ensName: string = 'alpha.atlas.eth'): Promise<AgentEnsProfile> {
  return {
    name: ensName,
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    strategy: 'L1/L2_CROSS_VENUE_ARBITRAGE',
    maxSpend: '5.0 ETH / 10,000 USDC',
    version: 'v2.4.0-agentic',
    ensip26Verified: true,
    network: 'ENSv2 Sepolia Beta',
  };
}
