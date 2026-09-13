'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatEther, type Address } from 'viem';
import { WalletModal, WalletOption } from '../components/WalletModal';

export interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: string | null;
  error: string | null;
  isModalOpen: boolean;
  availableWallets: WalletOption[];
  connectingWalletId: string | null;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connect: (providerId?: string) => Promise<boolean>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  balance: '0.00',
  isConnected: false,
  isConnecting: false,
  walletType: null,
  error: null,
  isModalOpen: false,
  availableWallets: [],
  connectingWalletId: null,
  openWalletModal: () => {},
  closeWalletModal: () => {},
  connect: async () => false,
  disconnect: () => {}
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  // Detect installed browser wallet extensions
  const detectWallets = useCallback((): WalletOption[] => {
    if (typeof window === 'undefined') return [];

    const eth = (window as any).ethereum;
    const phantom = (window as any).phantom;
    const solana = (window as any).solana;
    const okx = (window as any).okxwallet;
    const coinbase = (window as any).coinbaseWalletExtension;
    const backpack = (window as any).backpack;

    const isMetaMaskInstalled = Boolean(eth?.isMetaMask || (eth?.providers && eth.providers.some((p: any) => p.isMetaMask)));
    const isPhantomInstalled = Boolean(phantom?.ethereum || phantom?.solana || solana?.isPhantom);
    const isCoinbaseInstalled = Boolean(coinbase || eth?.isCoinbaseWallet);
    const isOkxInstalled = Boolean(okx);
    const isRabbyInstalled = Boolean(eth?.isRabby);
    const isBackpackInstalled = Boolean(backpack);
    const isInjectedInstalled = Boolean(eth && !isMetaMaskInstalled && !isRabbyInstalled);

    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        description: 'EVM wallet extension & mobile app',
        downloadUrl: 'https://metamask.io/download/',
        isInstalled: isMetaMaskInstalled,
        chainType: 'EVM'
      },
      {
        id: 'phantom',
        name: 'Phantom',
        icon: '👻',
        description: 'Solana & Ethereum multichain wallet',
        downloadUrl: 'https://phantom.app/',
        isInstalled: isPhantomInstalled,
        chainType: 'Multi-chain'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        description: 'Self-custody Web3 wallet by Coinbase',
        downloadUrl: 'https://www.coinbase.com/wallet',
        isInstalled: isCoinbaseInstalled,
        chainType: 'EVM'
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        icon: '⬛',
        description: 'Universal Web3 multichain wallet',
        downloadUrl: 'https://www.okx.com/web3',
        isInstalled: isOkxInstalled,
        chainType: 'Multi-chain'
      },
      {
        id: 'rabby',
        name: 'Rabby Wallet',
        icon: '🐰',
        description: 'Game-changing EVM security wallet',
        downloadUrl: 'https://rabby.io/',
        isInstalled: isRabbyInstalled,
        chainType: 'EVM'
      },
      {
        id: 'backpack',
        name: 'Backpack',
        icon: '🎒',
        description: 'Next-gen Solana & EVM exchange wallet',
        downloadUrl: 'https://backpack.app/',
        isInstalled: isBackpackInstalled,
        chainType: 'Multi-chain'
      },
      {
        id: 'injected',
        name: 'Browser Wallet',
        icon: '🌐',
        description: 'Injected web3 provider',
        downloadUrl: 'https://ethereum.org/en/wallets/',
        isInstalled: isInjectedInstalled || Boolean(eth),
        chainType: 'EVM'
      }
    ];
  }, []);

  // Update list of wallets when component mounts
  useEffect(() => {
    setAvailableWallets(detectWallets());
  }, [detectWallets]);

  // Fetch real balance for account
  const fetchBalance = useCallback(async (addr: string, providerObj?: any) => {
    try {
      if (typeof window !== 'undefined') {
        const eth = providerObj || (window as any).ethereum || (window as any).phantom?.ethereum || (window as any).okxwallet;
        if (eth && typeof eth.request === 'function') {
          const hexBal: string = await eth.request({
            method: 'eth_getBalance',
            params: [addr, 'latest']
          });
          if (hexBal && hexBal !== '0x' && hexBal !== '0x0') {
            const wei = BigInt(hexBal);
            const val = Number(formatEther(wei));
            setBalance(val.toFixed(val < 0.001 && val > 0 ? 5 : 3));
            return;
          }
        }
      }
      setBalance('0.00');
    } catch (e) {
      console.warn('[WalletContext] balance check fallback:', e);
      setBalance('0.00');
    }
  }, []);

  // Resolve target provider object for specified walletId
  const getProviderForWallet = (walletId: string) => {
    if (typeof window === 'undefined') return null;

    const w = window as any;

    if (walletId === 'metamask') {
      if (w.ethereum?.providers) {
        return w.ethereum.providers.find((p: any) => p.isMetaMask) || w.ethereum;
      }
      return w.ethereum?.isMetaMask ? w.ethereum : w.ethereum;
    }

    if (walletId === 'phantom') {
      return w.phantom?.ethereum || w.phantom?.solana || w.solana;
    }

    if (walletId === 'coinbase') {
      return w.coinbaseWalletExtension || w.ethereum;
    }

    if (walletId === 'okx') {
      return w.okxwallet || w.ethereum;
    }

    if (walletId === 'rabby') {
      return w.ethereum?.isRabby ? w.ethereum : w.ethereum;
    }

    if (walletId === 'backpack') {
      return w.backpack?.ethereum || w.backpack;
    }

    return w.ethereum || w.solana;
  };

  // Trigger permission prompt in user's browser extension
  const connect = useCallback(
    async (providerId?: string): Promise<boolean> => {
      setError(null);
      setIsConnecting(true);

      const targetId = providerId || 'metamask';
      setConnectingWalletId(targetId);

      try {
        const provider = getProviderForWallet(targetId);

        if (!provider) {
          throw new Error(`Wallet extension (${targetId}) not detected. Please install the browser extension.`);
        }

        // EVM Provider Connection Request (eth_requestAccounts)
        if (typeof provider.request === 'function') {
          const accounts: string[] = await provider.request({
            method: 'eth_requestAccounts'
          });

          if (accounts && accounts.length > 0) {
            const userAddr = accounts[0];
            setAddress(userAddr);
            setWalletType(targetId);
            localStorage.setItem('atlas_connected_wallet_type', targetId);
            localStorage.setItem('atlas_wallet_address', userAddr);
            await fetchBalance(userAddr, provider);
            setIsModalOpen(false);
            return true;
          }
        }
        
        // Solana Provider Connection Request (connect())
        if (typeof provider.connect === 'function') {
          const resp = await provider.connect();
          const userAddr = resp.publicKey ? resp.publicKey.toString() : (resp.address || provider.publicKey?.toString());
          
          if (userAddr) {
            setAddress(userAddr);
            setWalletType(targetId);
            localStorage.setItem('atlas_connected_wallet_type', targetId);
            localStorage.setItem('atlas_wallet_address', userAddr);
            setBalance('0.00');
            setIsModalOpen(false);
            return true;
          }
        }

        throw new Error('No accounts authorized by wallet.');
      } catch (err: any) {
        console.error('[WalletContext] Connection failed:', err);
        const errMsg =
          err?.code === 4001 || err?.message?.includes('user rejected') || err?.message?.includes('User rejected')
            ? 'Connection prompt was rejected in your wallet extension window. Please grant permission to continue.'
            : err?.message || 'Failed to connect wallet. Please ensure your browser extension is unlocked.';
        
        setError(errMsg);
        return false;
      } finally {
        setIsConnecting(false);
        setConnectingWalletId(null);
      }
    },
    [fetchBalance]
  );

  const openWalletModal = useCallback(() => {
    setAvailableWallets(detectWallets());
    setError(null);
    setIsModalOpen(true);
  }, [detectWallets]);

  const closeWalletModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0.00');
    setWalletType(null);
    setError(null);
    localStorage.removeItem('atlas_connected_wallet_type');
    localStorage.removeItem('atlas_wallet_address');
  }, []);

  // Silent auto-reconnect on page load ONLY if user previously approved permissions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedType = localStorage.getItem('atlas_connected_wallet_type');
    const storedAddress = localStorage.getItem('atlas_wallet_address');

    if (storedType && storedAddress) {
      const provider = getProviderForWallet(storedType);
      if (provider && typeof provider.request === 'function') {
        provider
          .request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setWalletType(storedType);
              fetchBalance(accounts[0], provider);
            } else {
              disconnect();
            }
          })
          .catch(() => disconnect());
      } else {
        setAddress(storedAddress);
        setWalletType(storedType);
      }
    }

    // Subscribe to extension events
    const eth = (window as any).ethereum;
    if (eth && typeof eth.on === 'function') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          disconnect();
        }
      };

      const handleChainChanged = () => {
        if (address) fetchBalance(address);
      };

      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);

      return () => {
        eth.removeListener?.('accountsChanged', handleAccountsChanged);
        eth.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [address, fetchBalance, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected: !!address,
        isConnecting,
        walletType,
        error,
        isModalOpen,
        availableWallets,
        connectingWalletId,
        openWalletModal,
        closeWalletModal,
        connect,
        disconnect
      }}
    >
      {children}

      <WalletModal
        isOpen={isModalOpen}
        onClose={closeWalletModal}
        wallets={availableWallets}
        onSelectWallet={connect}
        isConnecting={isConnecting}
        connectingWalletId={connectingWalletId}
        error={error}
      />
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletState {
  return useContext(WalletContext);
}
