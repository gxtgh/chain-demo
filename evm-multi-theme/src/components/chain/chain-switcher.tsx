import { supportedChains } from '@/config/chains'
import { useRenderMode } from '@/app/render-mode'
import { useRouteContext } from '@/app/use-route-context'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { getPageSupportedChains } from '@/config/routes'
import { useAccount, useSwitchChain } from 'wagmi'

function ChainLogo({ src, alt }: { src: string; alt: string }) {
  return <img className="chain-menu-logo" src={src} alt={alt} />
}

export function ChainSwitcher() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticChainSwitcher />
  }

  return <InteractiveChainSwitcher />
}

function StaticChainSwitcher() {
  const { t, chain, page } = useRouteContext()
  const pageSupportedChains = getPageSupportedChains(page)
  const currentChain = pageSupportedChains.find((chainOption) => chainOption.key === chain) ?? pageSupportedChains[0] ?? supportedChains[0]

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.chain')}
      icon={<ChainLogo src={currentChain.icon} alt={currentChain.fullName} />}
      value={chain}
      options={pageSupportedChains.map((chainOption) => ({
        value: chainOption.key,
        key: chainOption.key,
        label: chainOption.fullName,
        code: chainOption.name,
        prefix: <ChainLogo src={chainOption.icon} alt={chainOption.fullName} />,
      }))}
      onChange={() => undefined}
    />
  )
}

function InteractiveChainSwitcher() {
  const { t, chain, page, lang, navigateToPage } = useRouteContext()
  const { isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const pageSupportedChains = getPageSupportedChains(page)
  const currentChain = pageSupportedChains.find((chainOption) => chainOption.key === chain) ?? pageSupportedChains[0] ?? supportedChains[0]

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.chain')}
      icon={<ChainLogo src={currentChain.icon} alt={currentChain.fullName} />}
      value={chain}
      options={pageSupportedChains.map((chainOption) => ({
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

        const target = pageSupportedChains.find((item) => item.key === nextChainKey)

        if (isConnected && target) {
          if (chainId === target.chainId) {
            navigateToPage(page, {
              nextLang: lang,
              nextChain: nextChainKey,
              preserveSearch: true,
              replace: true,
            })
            return
          }

          void switchChainAsync({ chainId: target.chainId })
            .then(() => {
              navigateToPage(page, {
                nextLang: lang,
                nextChain: nextChainKey,
                preserveSearch: true,
                persist: 'session',
                replace: true,
              })
            })
            .catch(() => undefined)
          return
        }

        navigateToPage(page, {
          nextLang: lang,
          nextChain: nextChainKey,
          preserveSearch: true,
          replace: true,
        })
      }}
    />
  )
}
