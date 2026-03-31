import { ChainSwitcher } from '@/components/chain/chain-switcher'
import { useRouteContext } from '@/app/use-route-context'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button'

export function Topbar() {
  const { t, chainDefinition } = useRouteContext()

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">{chainDefinition.shortName}</div>
        <div>
          <strong>{t('app.name')}</strong>
          <span>{t('app.tagline')}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <ChainSwitcher />
        <LanguageSwitcher />
        <ThemeSwitcher />
        <ConnectWalletButton />
      </div>
    </div>
  )
}
