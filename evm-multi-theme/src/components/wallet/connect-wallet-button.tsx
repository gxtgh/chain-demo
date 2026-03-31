import { useAppKit, useAppKitAccount, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react'
import { bsc, base, mainnet } from '@reown/appkit/networks'
import { useEffect } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import { supportedChains } from '@/config/chains'

function shortAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function SwitchNetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 6.9l4.3 7.45a.7.7 0 01-.61 1.05H8.3a.7.7 0 01-.61-1.05L12 6.9z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 10.2v2.35" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="14.2" r="0.95" fill="#fff" />
    </svg>
  )
}

export function ConnectWalletButton() {
  const { t, chain, page, lang, theme, themeColor, chainDefinition, navigateToPage } = useRouteContext()
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const { walletInfo } = useWalletInfo()
  const isWrongChain = isConnected && chainId !== chainDefinition.chainId
  const isConnecting = status === 'connecting'
  const targetNetwork =
    chainDefinition.key === 'bsc' ? bsc : chainDefinition.key === 'base' ? base : mainnet

  useEffect(() => {
    if (!isConnected || !chainId) {
      return
    }

    const matchedChain = supportedChains.find((item) => item.chainId === chainId)
    if (!matchedChain || matchedChain.key === chain) {
      return
    }

    navigateToPage(page, {
      nextLang: lang,
      nextChain: matchedChain.key,
      nextTheme: theme,
      nextThemeColor: themeColor,
    })
  }, [chain, chainId, isConnected, lang, navigateToPage, page, theme, themeColor])

  if (isConnected && address) {
    if (isWrongChain) {
      return (
        <button className="wallet-button wallet-button-danger" onClick={() => void switchNetwork?.(targetNetwork)} type="button">
          <span className="wallet-button-switch-icon">
            <SwitchNetworkIcon />
          </span>
          {t('wallet.wrongChain')}
        </button>
      )
    }

    return (
      <button className="wallet-button wallet-button-connected" type="button" onClick={() => void open()}>
        {walletInfo?.icon ? <img className="wallet-button-icon" src={walletInfo.icon} alt="wallet" /> : null}
        {shortAddress(address)}
      </button>
    )
  }

  return (
    <button
      className="wallet-button"
      disabled={isConnecting}
      onClick={() => void open()}
      type="button"
    >
      {isConnecting ? t('wallet.connecting') : t('wallet.connect')}
    </button>
  )
}
