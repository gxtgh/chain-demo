import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getChainConfig, type SupportedChainKey } from '../config/chains'
import {
  addOrSwitchChain,
  getInjectedAccount,
  hasInjectedWallet,
  requestWalletAccount,
  shortAddress,
} from '../services/wallet/evm-wallet'

type WalletContextValue = {
  account: string | null
  accountLabel: string
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  walletError: string
  connectWallet: (chainKey: SupportedChainKey) => Promise<void>
  clearWalletError: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState('')

  const syncWalletState = useCallback(async () => {
    const result = await getInjectedAccount()
    setAccount(result.account)
    setChainId(result.chainId)
  }, [])

  useEffect(() => {
    void syncWalletState()

    if (!window.ethereum?.on) {
      return
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? (args[0] as string[]) : []
      setAccount(accounts[0] ?? null)
    }

    const handleChainChanged = (...args: unknown[]) => {
      const chainHex = typeof args[0] === 'string' ? args[0] : ''
      setChainId(Number.parseInt(chainHex, 16))
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [syncWalletState])

  const connectWallet = useCallback(async (chainKey: SupportedChainKey) => {
    setIsConnecting(true)
    setWalletError('')

    try {
      if (!hasInjectedWallet()) {
        throw new Error('No injected EVM wallet detected. Please install MetaMask or a compatible wallet.')
      }

      const chainConfig = getChainConfig(chainKey)
      await addOrSwitchChain(chainConfig)
      const nextAccount = await requestWalletAccount()
      setAccount(nextAccount)
      setChainId(chainConfig.chainId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet.'
      setWalletError(message)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({
      account,
      accountLabel: account ? shortAddress(account) : '',
      chainId,
      isConnected: Boolean(account),
      isConnecting,
      walletError,
      connectWallet,
      clearWalletError: () => setWalletError(''),
    }),
    [account, chainId, connectWallet, isConnecting, walletError],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used inside WalletProvider')
  }
  return context
}
