export const WORLD_CONFIG = {
  appId: process.env.NEXT_PUBLIC_WORLD_APP_ID || 'app_staging_atlas_trading_01',
  actionHighRiskTrade: 'approve-high-risk-trade',
  actionKillSwitch: 'execute-emergency-kill-switch',
  agentId: 'agent_world_atlas_004912',
  nullifierHash: '0x2b89f01a39d84c01e...4f91',
};

export interface WorldVerificationResult {
  nullifier_hash: string;
  merkle_root: string;
  proof: string;
  verification_level: 'orb' | 'device' | 'selfie';
}
