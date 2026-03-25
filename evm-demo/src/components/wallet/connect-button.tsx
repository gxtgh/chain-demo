import type { SupportedChainKey } from '../../config/chains'
import { useWallet } from '../../contexts/wallet-context'

type ConnectButtonProps = {
  chain: SupportedChainKey
  label: string
}

export function ConnectButton({ chain, label }: ConnectButtonProps) {
  const { accountLabel, connectWallet, isConnected, isConnecting } = useWallet()

  return (
    <button
      className="primary-button"
      type="button"
      onClick={() => void connectWallet(chain)}
      disabled={isConnecting}
    >
      {isConnecting ? '...' : isConnected ? `${label}: ${accountLabel}` : label}
    </button>
  )
}
