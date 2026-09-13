'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatEther, type Address } from 'viem';

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

export function useWallet(): WalletState {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDemoWallet, setIsDemoWallet] = useState<boolean>(false);

  const fetchBalance = useCallback(async (addr: Address) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const hexBal: string = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest']
        });
        const wei = BigInt(hexBal);
        const eth = Number(formatEther(wei));
        setBalance(eth.toFixed(eth < 0.001 && eth > 0 ? 5 : 3));
        return;
      }
    } catch {
      // Ignore
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;

        // Directly invoke eth_requestAccounts on the user's installed browser wallet (MetaMask, Coinbase, Rabby, etc.)
        const accounts: string[] = await provider.request({
          method: 'eth_requestAccounts'
        });

        if (accounts && accounts.length > 0) {
          const userAddr = accounts[0] as Address;
          setAddress(userAddr);
          setIsDemoWallet(false);
          localStorage.setItem('atlas_user_wallet_connected', 'true');
          localStorage.removeItem('demo_wallet_connected');
          await fetchBalance(userAddr);
        }
      } else {
        alert('No Web3 wallet extension detected! Please install or unlock MetaMask, Rabby, Coinbase Wallet, or any browser extension.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err?.code === 4001) {
        // User rejected the connection request
        console.log('User cancelled wallet connection request');
      } else {
        alert(`Could not connect wallet: ${err?.message || 'Check your wallet extension'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const connectDemoWallet = useCallback(() => {
    // If user explicitly asks for demo account
    const DEMO_OWNER_ADDRESS: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    setAddress(DEMO_OWNER_ADDRESS);
    setIsDemoWallet(true);
    fetchBalance(DEMO_OWNER_ADDRESS);
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0.00');
    setIsDemoWallet(false);
    localStorage.removeItem('atlas_user_wallet_connected');
    localStorage.removeItem('demo_wallet_connected');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const provider = (window as any).ethereum;

    // Only auto-reconnect if the user previously connected their real wallet
    const wasConnected = localStorage.getItem('atlas_user_wallet_connected');
    if (wasConnected === 'true') {
      provider
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            const userAddr = accounts[0] as Address;
            setAddress(userAddr);
            setIsDemoWallet(false);
            fetchBalance(userAddr);
          }
        })
        .catch(() => {});
    }

    // Listen to account changes in wallet extension
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0] as Address;
        setAddress(userAddr);
        setIsDemoWallet(false);
        fetchBalance(userAddr);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      if (address) fetchBalance(address);
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [address, fetchBalance, disconnect]);

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
