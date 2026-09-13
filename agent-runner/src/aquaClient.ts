export interface AquaQuote {
  srcToken: string;
  dstToken: string;
  inAmount: string;
  outAmount: string;
  swapVmPayload: string;
  estimatedGas: number;
  yieldApyPct: number;
  custodyMode: string;
}

export async function get1inchAquaQuote(
  srcToken: string = 'USDC',
  dstToken: string = 'ETH',
  amount: string = '1000'
): Promise<AquaQuote> {
  const swapVmInstructions = '0x01003202'; // Opcode: OP_VERIFY_GUARDRAIL(0.50% max slippage) -> OP_EXECUTE_SWAP

  return {
    srcToken,
    dstToken,
    inAmount: amount,
    outAmount: (parseFloat(amount) / 2520.5).toFixed(4),
    swapVmPayload: swapVmInstructions,
    estimatedGas: 120000,
    yieldApyPct: 4.82,
    custodyMode: '1inch Aqua Self-Custodial (Vault Retains Capital Control)',
  };
}
