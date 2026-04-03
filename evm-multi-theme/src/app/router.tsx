import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { buildPagePath } from '@/config/routes'
import { DEFAULT_PAGE, isSupportedChain, isSupportedLang, isSupportedPage } from '@/config/chains'
import { AppShell } from '@/components/layout/app-shell'
import { TokenCreationPage } from '@/features/tokenCreation/shared/token-creation-page'
import { ProjectAcceptancePage } from '@/features/projectAcceptance/pages/project-acceptance-page'
import { resolveAppPreferences } from './preferences'

function buildPreferredPath(pathname: string, search: string, fallbackPage = DEFAULT_PAGE) {
  const segments = pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments
  const searchParams = new URLSearchParams(search)
  const resolvedPreferences = resolveAppPreferences({
    lang,
    chain,
    theme: searchParams.get('theme'),
    themeColor: searchParams.get('themeColor'),
  })

  return buildPagePath(
    resolvedPreferences.lang,
    resolvedPreferences.chain,
    isSupportedPage(page) ? page : fallbackPage,
    {
      theme: resolvedPreferences.theme,
      themeColor: resolvedPreferences.themeColor,
    },
  )
}

function RootRedirect() {
  const location = useLocation()
  return <Navigate replace to={buildPreferredPath(location.pathname, location.search)} />
}

function RouteGate() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments

  if (!isSupportedLang(lang) || !isSupportedChain(chain) || !isSupportedPage(page)) {
    return <Navigate replace to={buildPreferredPath(location.pathname, location.search)} />
  }

  return <AppShell><Outlet /></AppShell>
}

function NestedFallback() {
  const location = useLocation()
  return <Navigate replace to={buildPreferredPath(location.pathname, location.search)} />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/:lang/:chain" element={<RouteGate />}>
        <Route path="token-creation" element={<TokenCreationPage />} />
        <Route path="project-acceptance" element={<ProjectAcceptancePage />} />
        <Route path="*" element={<NestedFallback />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
