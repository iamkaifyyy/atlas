import type { AgentConfig, TriggerCondition } from '../../shared/types/agentConfig.js';
import type { ContractClient } from './contractClient.js';
import type { PriceTick } from './priceFeed.js';
import type { MatchingEngine } from './orderbook/matchingEngine.js';

export interface EvaluationResult {
  triggered: boolean;
  reason: string;
  action?: 'BUY' | 'SELL';
  amount?: number;
  price?: number;
  txHash?: string;
  fillsCount?: number;
  error?: string;
}

export class RuleEngine {
  private config: AgentConfig;
  private contractClient: ContractClient;
  private matchingEngine: MatchingEngine;
  private lastTriggeredAt = 0;
  private cooldownMs = 5000;
  private isProcessing = false;

  constructor(
    initialConfig: AgentConfig,
    contractClient: ContractClient,
    matchingEngine: MatchingEngine
  ) {
    this.config = initialConfig;
    this.contractClient = contractClient;
    this.matchingEngine = matchingEngine;
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AgentConfig>): AgentConfig {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.vaultAddress) {
      this.contractClient.setVaultAddress(newConfig.vaultAddress);
    }
    return this.config;
  }

  public async evaluate(tick: PriceTick): Promise<EvaluationResult> {
    if (!this.config.active) {
      return { triggered: false, reason: 'agent disabled' };
    }

    const now = Date.now();
    if (now - this.lastTriggeredAt < this.cooldownMs) {
      return { triggered: false, reason: 'cooldown' };
    }

    if (this.isProcessing) {
      return { triggered: false, reason: 'in-flight' };
    }

    const trigger = this.config.trigger;
    const isTriggerMet = this.checkTrigger(tick.price, trigger);

    if (!isTriggerMet) {
      return {
        triggered: false,
        reason: `price ${tick.price} outside trigger (${trigger.type} ${trigger.targetPrice})`
      };
    }

    this.isProcessing = true;
    this.lastTriggeredAt = now;

    console.log(`[rule-engine] trigger fired: ${tick.price} matched ${trigger.type} $${trigger.targetPrice}`);

    try {
      let txHash: string | undefined;

      // 1. If on-chain vault is connected, submit transaction to enforce spending caps
      if (this.contractClient.vaultAddress) {
        const result = await this.contractClient.submitTrade(
          this.config.tradeAmount,
          tick.price
        );
        txHash = result.hash;
      }

      // 2. Execute against the Order Book Matching Engine
      const { fills } = this.matchingEngine.createOrder({
        userId: 'autonomous-agent',
        side: this.config.action,
        type: 'MARKET',
        quantity: this.config.tradeAmount
      });

      console.log(`[rule-engine] trade executed in matching engine: ${fills.length} fill(s)`);

      // Log to Hedera Consensus Service audit trail in the background
      try {
        const { logTradeToHederaHCS } = await import('./hederaClient.js');
        await logTradeToHederaHCS({
          tradeId: Date.now(),
          symbol: this.config.assetPair,
          side: this.config.action,
          amount: this.config.tradeAmount,
          price: tick.price,
          status: 'EXECUTED',
          timestamp: Date.now()
        });
      } catch (hcsErr) {
        console.warn('[rule-engine] Hedera HCS background log warning:', (hcsErr as Error).message);
      }

      return {
        triggered: true,
        reason: txHash ? 'submitted on-chain and matched in orderbook' : 'matched in orderbook',
        action: this.config.action,
        amount: this.config.tradeAmount,
        price: tick.price,
        txHash,
        fillsCount: fills.length
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('[rule-engine] trade submission failed:', errorMsg);
      return {
        triggered: true,
        reason: 'reverted on-chain',
        action: this.config.action,
        amount: this.config.tradeAmount,
        price: tick.price,
        error: errorMsg
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private checkTrigger(currentPrice: number, trigger: TriggerCondition): boolean {
    if (trigger.type === 'PRICE_BELOW') {
      return currentPrice <= trigger.targetPrice;
    }
    if (trigger.type === 'PRICE_ABOVE') {
      return currentPrice >= trigger.targetPrice;
    }
    return false;
  }
}
