import { Drawer } from 'antd'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import { ArrowUpIcon } from '@/components/common/topbar-icons'
import { LanguageSwitcher } from '@/components/language/language-switcher'
import { navigationItems } from '@/config/navigation'
import { isPageChainSupported } from '@/config/routes'
import { ShareMenu } from '@/components/share/share-menu'
import { ShareSiteModal } from '@/components/share/share-site-modal'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { AppFooter } from './app-footer'
import { PageChainWatermark } from './page-chain-watermark'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: ReactNode }) {
  const { t, chain, page, theme, themeColor, navigateToPage } = useRouteContext()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const isHomePage = page === 'home'
  const logoSrc = `/img/common/logo-${themeColor}.png`
  const navItems = useMemo(
    () =>
      navigationItems
        .filter((item) => isPageChainSupported(item.page, chain))
        .map((item) => ({
          ...item,
          label: t(item.titleKey),
        })),
    [chain, t],
  )

  useEffect(() => {
    const faviconHref = `/img/common/favicon-${themeColor}.ico`
    let faviconLink = document.querySelector<HTMLLinkElement>('link[data-app-favicon]')

    if (!faviconLink) {
      faviconLink = document.createElement('link')
      faviconLink.rel = 'icon'
      faviconLink.type = 'image/x-icon'
      faviconLink.setAttribute('data-app-favicon', 'true')
      document.head.appendChild(faviconLink)
    }

    faviconLink.href = faviconHref
  }, [themeColor])

  useEffect(() => {
    const body = document.body
    const themeClass = `app-theme-${theme}`
    const themeColorClass = `app-theme-color-${themeColor}`

    body.classList.add('app-theme', themeClass, themeColorClass)

    return () => {
      body.classList.remove('app-theme', themeClass, themeColorClass)
    }
  }, [theme, themeColor])

  useEffect(() => {
    function updateScrollTopVisibility() {
      const nextVisible = window.scrollY > 100
      setShowScrollTop((currentVisible) => (currentVisible === nextVisible ? currentVisible : nextVisible))
    }

    updateScrollTopVisibility()
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollTopVisibility)
    }
  }, [])

  return (
    <div className={`app-shell theme-${theme} theme-color-${themeColor}`}>
      <PageChainWatermark />
      <Topbar onOpenMobileControls={() => setMobileDrawerOpen(true)} onOpenShare={() => setShareModalOpen(true)} />
      <Drawer
        className="mobile-drawer mobile-only"
        closeIcon={false}
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        placement="right"
        title={
          <div className="mobile-drawer-brand">
            <div className="mobile-drawer-brand-mark">
              <img src={logoSrc} alt={`${t('app.name')} logo`} />
            </div>
            <div className="mobile-drawer-brand-copy">
              <strong>{t('app.name')}</strong>
              <span>{t('app.tagline')}</span>
            </div>
          </div>
        }
        size={320}
      >
        <div className="mobile-drawer-sections">
          <section className="mobile-drawer-section">
            <h3>{t('mobile.routes')}</h3>
            <div className="mobile-panel-content">
              {navItems.map((item) => (
                <button
                  className={`sidebar-link ${page === item.page ? 'active' : ''}`}
                  key={item.page}
                  onClick={() => {
                    navigateToPage(item.page)
                    setMobileDrawerOpen(false)
                  }}
                  type="button"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mobile-drawer-section">
            <h3>{t('mobile.settings')}</h3>
            <div className="mobile-settings-grid">
              <LanguageSwitcher showValue className="mobile-settings-button" />
              <ThemeSwitcher showValue className="mobile-settings-button" />
              <ShareMenu
                showValue
                className="mobile-settings-button"
                placement="bottom"
                onShare={() => {
                  setMobileDrawerOpen(false)
                  setShareModalOpen(true)
                }}
              />
            </div>
          </section>
        </div>
      </Drawer>
      <ShareSiteModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} />
      <div className={`layout-grid ${isHomePage ? 'layout-grid-home' : ''}`}>
        {isHomePage ? null : (
          <aside className="sidebar-card">
            {navItems.map((item) => (
              <button
                className={`sidebar-link ${page === item.page ? 'active' : ''}`}
                key={item.page}
                onClick={() => navigateToPage(item.page)}
                type="button"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </aside>
        )}
        <main className={`page-shell ${isHomePage ? 'page-shell-home' : ''}`}>{children}</main>
      </div>
      <AppFooter />
      <button
        aria-label={t('common.backToTop')}
        className={`scroll-top-button ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        type="button"
      >
        <ArrowUpIcon />
      </button>
    </div>
  )
}
