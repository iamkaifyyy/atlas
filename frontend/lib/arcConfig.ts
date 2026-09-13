export const ARC_TESTNET_CONFIG = {
  chainId: 5040,
  name: 'Arc Testnet (Circle L1)',
  currency: 'USDC',
  rpcUrl: 'https://testnet-rpc.arc.network',
  explorerUrl: 'https://testnet.arcscan.io',
  usdcAddress: '0x3c44CdD0467e5E11A01A20112e372141B7031300',
  vaultAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
};

export function buildArcScanTxUrl(txHash: string): string {
  return `${ARC_TESTNET_CONFIG.explorerUrl}/tx/${txHash}`;
}

export function buildArcScanAddressUrl(address: string): string {
  return `${ARC_TESTNET_CONFIG.explorerUrl}/address/${address}`;
}
