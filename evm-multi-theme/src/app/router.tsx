import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { buildDefaultPath, buildPagePath } from '@/config/routes'
import { DEFAULT_CHAIN, DEFAULT_LANG, isSupportedChain, isSupportedLang, isSupportedPage } from '@/config/chains'
import { AppShell } from '@/components/layout/app-shell'
import { TokenCreationPage } from '@/features/tokenCreation/shared/token-creation-page'
import { TokenTaxCreationPage } from '@/features/tokenTaxCreation/shared/token-tax-creation-page'
import { ProjectAcceptancePage } from '@/features/projectAcceptance/pages/project-acceptance-page'

function RouteGate() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments

  if (!isSupportedLang(lang) || !isSupportedChain(chain) || !isSupportedPage(page)) {
    return <Navigate replace to={buildDefaultPath()} />
  }

  return <AppShell><Outlet /></AppShell>
}

function NestedFallback() {
  return <Navigate replace to={buildPagePath(DEFAULT_LANG, DEFAULT_CHAIN, 'token-creation')} />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={buildDefaultPath()} />} />
      <Route path="/:lang/:chain" element={<RouteGate />}>
        <Route path="token-creation" element={<TokenCreationPage />} />
        <Route path="tax-token-creation" element={<TokenTaxCreationPage />} />
        <Route path="project-acceptance" element={<ProjectAcceptancePage />} />
        <Route path="*" element={<NestedFallback />} />
      </Route>
      <Route path="*" element={<Navigate replace to={buildDefaultPath()} />} />
    </Routes>
  )
}
