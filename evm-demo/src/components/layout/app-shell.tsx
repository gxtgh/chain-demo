import { Outlet, useLocation } from 'react-router-dom'
import { supportedChains, supportedLanguages, type SupportedChainKey, type SupportedLang, type SupportedPageKey } from '../../config/chains'
import { useTheme } from '../../contexts/theme-context'
import { useWallet } from '../../contexts/wallet-context'
import { useAppRoute } from '../../hooks/use-app-route'
import { ConnectButton } from '../wallet/connect-button'

const pageLinks: Array<{ key: SupportedPageKey; navKey: 'nav.standard' | 'nav.tax' }> = [
  { key: 'create-token', navKey: 'nav.standard' },
  { key: 'create-tax-token', navKey: 'nav.tax' },
]

export function AppShell() {
  const { chain, lang, navigateTo, page, t } = useAppRoute()
  const { theme, toggleTheme } = useTheme()
  const { walletError, clearWalletError } = useWallet()
  const location = useLocation()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">{t('nav.appName')}</p>
          <h1 className="sidebar-title">{t('nav.tagline')}</h1>
          <p className="sidebar-copy">{t('nav.description')}</p>
        </div>

        <nav className="sidebar-nav">
          {pageLinks.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-nav-item${page === item.key ? ' active' : ''}`}
              onClick={() => navigateTo(item.key, chain, lang)}
            >
              <span>{t(item.navKey)}</span>
              <small>{item.key}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>{t('shell.connectHint')}</strong>
          <p>{t('shell.notImplemented')}</p>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div className="topbar-group">
            <label className="toolbar-field">
              <span>{t('shell.chain')}</span>
              <select
                value={chain}
                onChange={(event) => navigateTo(page, event.target.value as SupportedChainKey, lang)}
              >
                {supportedChains.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="toolbar-field">
              <span>{t('shell.language')}</span>
              <select
                value={lang}
                onChange={(event) => navigateTo(page, chain, event.target.value as SupportedLang)}
              >
                {supportedLanguages.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="ghost-button" type="button" onClick={toggleTheme}>
              {theme === 'light' ? t('shell.dark') : t('shell.light')}
            </button>
          </div>

          <ConnectButton chain={chain} label={t('shell.connectWallet')} />
        </header>

        {walletError ? (
          <div className="warning-box inline-warning">
            <span>{walletError}</span>
            <button className="ghost-button" type="button" onClick={clearWalletError}>
              x
            </button>
          </div>
        ) : null}

        <div key={location.pathname} className="route-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
