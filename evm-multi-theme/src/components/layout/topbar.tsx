import { SettingsIcon } from '@/components/common/topbar-icons'
import { ChainSwitcher } from '@/components/chain/chain-switcher'
import { useRouteContext } from '@/app/use-route-context'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button'

export function Topbar({
  onOpenMobileControls,
}: {
  onOpenMobileControls: () => void
}) {
  const { t, themeColor } = useRouteContext()
  const logoSrc = `/img/common/logo-${themeColor}.png`

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <img src={logoSrc} alt={`${t('app.name')} logo`} />
        </div>
        <div className='description'>
          <strong>{t('app.name')}</strong>
          <span>{t('app.tagline')}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <ChainSwitcher />
        <div className="topbar-desktop-controls">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <button className="topbar-utility-button mobile-only" onClick={onOpenMobileControls} type="button" aria-label={t('mobile.controls')}>
          <SettingsIcon />
        </button>
        <ConnectWalletButton />
      </div>
    </div>
  )
}
