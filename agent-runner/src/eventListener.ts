import { WebSocketServer, WebSocket } from 'ws';
import { formatEther } from 'viem';
import type { ContractClient } from './contractClient.js';
import { AGENT_VAULT_ABI } from './contractClient.js';
import type { TradeEventPayload } from '../../shared/types/agentConfig.js';

export class EventListenerService {
  private wss: WebSocketServer | null = null;
  private contractClient: ContractClient;
  private recentEvents: TradeEventPayload[] = [];
  private maxHistory = 100;
  private unwatchList: Array<() => void> = [];

  constructor(contractClient: ContractClient) {
    this.contractClient = contractClient;
  }

  public attachWebSocketServer(wss: WebSocketServer): void {
    this.wss = wss;
    this.wss.on('connection', (ws: WebSocket) => {
      ws.send(JSON.stringify({ type: 'EVENT_HISTORY', data: this.recentEvents }));
    });
  }

  public broadcast(type: string, payload: unknown): void {
    if (!this.wss) return;
    const msg = JSON.stringify({ type, data: payload, timestamp: Date.now() });
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  }

  public getRecentEvents(): TradeEventPayload[] {
    return this.recentEvents;
  }

  public pushEvent(event: TradeEventPayload): void {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxHistory) {
      this.recentEvents.pop();
    }
    this.broadcast('TRADE_EVENT', event);
  }

  public startContractWatcher(): void {
    for (const unwatch of this.unwatchList) {
      try { unwatch(); } catch {}
    }
    this.unwatchList = [];

    const vault = this.contractClient.vaultAddress;
    if (!vault) return;

    try {
      const unwatchAll = this.contractClient.publicClient.watchContractEvent({
        address: vault,
        abi: AGENT_VAULT_ABI,
        onLogs: (logs) => {
          for (const log of logs) {
            this.handleContractLog(log);
          }
        },
        onError: (err) => {
          console.warn('[events] watch error:', (err as Error).message);
        }
      });
      this.unwatchList.push(unwatchAll);
    } catch (err) {
      console.warn('[events] failed to watch events:', (err as Error).message);
    }
  }

  private handleContractLog(log: any): void {
    const eventName = log.eventName;
    const args = log.args;

    let payload: TradeEventPayload | null = null;
    const now = Date.now();

    if (eventName === 'TradeExecuted') {
      payload = {
        tradeId: args.tradeId?.toString() || '0',
        timestamp: now,
        status: 'EXECUTED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: Number(formatEther(args.amount || 0n)),
        price: Number(args.price || 0) / 100,
        txHash: log.transactionHash
      };
    } else if (eventName === 'TradePendingApproval') {
      payload = {
        tradeId: args.tradeId?.toString() || '0',
        timestamp: now,
        status: 'PENDING_APPROVAL',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: Number(formatEther(args.amount || 0n)),
        price: Number(args.price || 0) / 100,
        txHash: log.transactionHash
      };
    } else if (eventName === 'TradeApproved') {
      payload = {
        tradeId: args.tradeId?.toString() || '0',
        timestamp: now,
        status: 'APPROVED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: Number(formatEther(args.amount || 0n)),
        price: Number(args.price || 0) / 100,
        txHash: log.transactionHash
      };
    } else if (eventName === 'TradeRejected') {
      payload = {
        tradeId: '0',
        timestamp: now,
        status: 'REJECTED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: Number(formatEther(args.amount || 0n)),
        price: Number(args.price || 0) / 100,
        txHash: log.transactionHash,
        reason: args.reason
      };
    } else if (eventName === 'KillSwitchTriggered') {
      payload = {
        tradeId: 'KILL',
        timestamp: now,
        status: 'KILLED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: Number(formatEther(args.refundedAmount || 0n)),
        price: 0,
        txHash: log.transactionHash,
        reason: 'Emergency kill switch triggered by owner'
      };
    }

    if (payload) {
      this.pushEvent(payload);
    }
  }
}
