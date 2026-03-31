import { supportedChains } from '@/config/chains'
import { useRouteContext } from '@/app/use-route-context'
import { ChainIcon } from '@/components/common/topbar-icons'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { useAccount, useSwitchChain } from 'wagmi'

function ChainLogo({ src, alt }: { src: string; alt: string }) {
  return <img className="chain-menu-logo" src={src} alt={alt} />
}

export function ChainSwitcher() {
  const { t, chain, page, lang, theme, themeColor, navigateToPage } = useRouteContext()
  const { isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.chain')}
      icon={<ChainIcon />}
      value={chain}
      options={supportedChains.map((chainOption) => ({
        value: chainOption.key,
        key: chainOption.key,
        label: chainOption.name,
        code: chainOption.shortName,
        prefix: <ChainLogo src={chainOption.icon} alt={chainOption.name} />,
      }))}
      onChange={(nextChain) => {
        navigateToPage(page, {
          nextLang: lang,
          nextChain: nextChain as typeof chain,
          nextTheme: theme,
          nextThemeColor: themeColor,
        })

        const target = supportedChains.find((item) => item.key === nextChain)
        if (isConnected && target) {
          void switchChainAsync({ chainId: target.chainId }).catch(() => undefined)
        }
      }}
    />
  )
}
