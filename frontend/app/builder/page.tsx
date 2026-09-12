'use client';

import React from 'react';
import { RuleBuilder } from '../../components/RuleBuilder';
import { useContractEvents } from '../../hooks/useContractEvents';

export default function BuilderPage() {
  const { currentPrice, agentConfig } = useContractEvents();

  return (
    <div className="py-4">
      <RuleBuilder
        currentPrice={currentPrice}
        initialConfig={agentConfig || undefined}
      />
    </div>
  );
}
