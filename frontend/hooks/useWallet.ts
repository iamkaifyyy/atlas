'use client';

import { useState, useEffect, useCallback } from 'react';
import { createWalletClient, createPublicClient, custom, http, formatEther, type Address } from 'viem';
import { localhost } from 'viem/chains';

export interface WalletState {
  address: Address | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  isDemoWallet: boolean;
  connect: () => Promise<void>;
  connectDemoWallet: () => void;
  disconnect: () => void;
}

const DEMO_OWNER_ADDRESS: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Anvil Account 0

export function useWallet(): WalletState {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDemoWallet, setIsDemoWallet] = useState<boolean>(false);

  const fetchBalance = useCallback(async (addr: Address) => {
    try {
      const publicClient = createPublicClient({
        chain: localhost,
        transport: http('http://127.0.0.1:8545')
      });
      const bal = await publicClient.getBalance({ address: addr });
      setBalance(Number(formatEther(bal)).toFixed(3));
    } catch {
      // Fallback demo balance
      setBalance('100.00');
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const walletClient = createWalletClient({
          chain: localhost,
          transport: custom((window as any).ethereum)
        });
        const [account] = await walletClient.requestAddresses();
        setAddress(account);
        setIsDemoWallet(false);
        await fetchBalance(account);
      } else {
        // Automatically fallback to Instant Demo Wallet if no browser extension is detected
        connectDemoWallet();
      }
    } catch (err) {
      console.warn('Wallet connection fallback to demo:', err);
      connectDemoWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const connectDemoWallet = useCallback(() => {
    setAddress(DEMO_OWNER_ADDRESS);
    setIsDemoWallet(true);
    fetchBalance(DEMO_OWNER_ADDRESS);
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0.00');
    setIsDemoWallet(false);
  }, []);

  useEffect(() => {
    // Check if demo wallet or existing connection is persisted
    const saved = localStorage.getItem('demo_wallet_connected');
    if (saved === 'true') {
      connectDemoWallet();
    }
  }, [connectDemoWallet]);

  return {
    address,
    balance,
    isConnected: !!address,
    isConnecting,
    isDemoWallet,
    connect,
    connectDemoWallet,
    disconnect
  };
}
