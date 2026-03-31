import { ReactNode } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import { AppFooter } from './app-footer'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: ReactNode }) {
  const { t, page, theme, themeColor, navigateToPage } = useRouteContext()

  return (
    <div className={`app-shell theme-${theme} theme-color-${themeColor}`}>
      <Topbar />
      <div className="layout-grid">
        <aside className="sidebar-card">
          <button
            className={`sidebar-link ${page === 'token-creation' ? 'active' : ''}`}
            onClick={() => navigateToPage('token-creation')}
            type="button"
          >
            <span>{t('nav.tokenCreation')}</span>
            <small>token-creation</small>
          </button>
          <button
            className={`sidebar-link ${page === 'project-acceptance' ? 'active' : ''}`}
            onClick={() => navigateToPage('project-acceptance')}
            type="button"
          >
            <span>{t('nav.projectAcceptance')}</span>
            <small>project-acceptance</small>
          </button>
        </aside>
        <main className="page-shell">{children}</main>
      </div>
      <AppFooter />
    </div>
  )
}
