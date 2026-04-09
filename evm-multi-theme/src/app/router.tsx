import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { buildPagePath, isPageChainSupported } from '@/config/routes'
import { DEFAULT_PAGE, isSupportedChain, isSupportedLang, isSupportedPage } from '@/config/chains'
import { AppShell } from '@/components/layout/app-shell'
import { HomePage } from '@/features/home/home-page'
import { TokenCreationPage } from '@/features/tokenCreation/shared/token-creation-page'
import { TokenTaxCreationPage } from '@/features/tokenTaxCreation/shared/token-tax-creation-page'
import { TokenVanityCreationPage } from '@/features/tokenVanityCreation/shared/token-vanity-creation-page'
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

  const resolvedPage = isSupportedPage(page) ? page : fallbackPage

  return buildPagePath(resolvedPreferences.lang, resolvedPreferences.chain, resolvedPage, {
    theme: resolvedPreferences.theme,
    themeColor: resolvedPreferences.themeColor,
  })
}

function RootRedirect() {
  const location = useLocation()
  return <Navigate replace to={buildPreferredPath(location.pathname, location.search)} />
}

function RouteGate() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments
  const resolvedPage = isSupportedPage(page) ? page : DEFAULT_PAGE

  if (!isSupportedLang(lang) || !isSupportedChain(chain) || !isPageChainSupported(resolvedPage, chain)) {
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
        <Route index element={<HomePage />} />
        <Route path="token-creation" element={<TokenCreationPage />} />
        <Route path="tax-token-creation" element={<TokenTaxCreationPage />} />
        <Route path="token-vanity-creation" element={<TokenVanityCreationPage />} />
        <Route path="*" element={<NestedFallback />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
