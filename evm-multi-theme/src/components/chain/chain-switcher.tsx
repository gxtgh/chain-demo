import { supportedChains } from '@/config/chains'
import { useRouteContext } from '@/app/use-route-context'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { useAccount, useSwitchChain } from 'wagmi'

function ChainLogo({ src, alt }: { src: string; alt: string }) {
  return <img className="chain-menu-logo" src={src} alt={alt} />
}

export function ChainSwitcher() {
  const { t, chain, page, lang, theme, themeColor, navigateToPage } = useRouteContext()
  const { isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const currentChain = supportedChains.find((chainOption) => chainOption.key === chain) ?? supportedChains[0]

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.chain')}
      icon={<ChainLogo src={currentChain.icon} alt={currentChain.fullName} />}
      value={chain}
      options={supportedChains.map((chainOption) => ({
        value: chainOption.key,
        key: chainOption.key,
        label: chainOption.fullName,
        code: chainOption.name,
        prefix: <ChainLogo src={chainOption.icon} alt={chainOption.fullName} />,
      }))}
      onChange={(nextChain) => {
        const nextChainKey = nextChain as typeof chain
        if (nextChainKey === chain) {
          return
        }

        const target = supportedChains.find((item) => item.key === nextChainKey)

        if (isConnected && target) {
          if (chainId === target.chainId) {
            navigateToPage(page, {
              nextLang: lang,
              nextChain: nextChainKey,
              nextTheme: theme,
              nextThemeColor: themeColor,
              replace: true,
            })
            return
          }

          void switchChainAsync({ chainId: target.chainId }).catch(() => undefined)
          return
        }

        navigateToPage(page, {
          nextLang: lang,
          nextChain: nextChainKey,
          nextTheme: theme,
          nextThemeColor: themeColor,
          replace: true,
        })
      }}
    />
  )
}
