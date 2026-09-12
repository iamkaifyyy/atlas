'use client';

import React from 'react';
import { Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { TradeEventPayload } from '../../../shared/types/agentConfig';

interface AgentTradeMarkerProps {
  event: TradeEventPayload;
}

export const AgentTradeMarker: React.FC<AgentTradeMarkerProps> = ({ event }) => {
  if (event.status === 'EXECUTED' || event.status === 'APPROVED') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Bought {event.amount} ETH @ ${event.price.toFixed(2)}</span>
      </div>
    );
  }

  if (event.status === 'PENDING_APPROVAL') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono animate-pulse">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span>Pending Approval: {event.amount} ETH</span>
      </div>
    );
  }

  if (event.status === 'REJECTED') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>Cap Blocked: {event.amount} ETH</span>
      </div>
    );
  }

  return null;
};
