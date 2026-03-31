import { useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  DEFAULT_CHAIN,
  DEFAULT_LANG,
  DEFAULT_PAGE,
  getChainDefinition,
  isSupportedChain,
  isSupportedLang,
  isSupportedPage,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from '@/config/chains'
import { buildPagePath } from '@/config/routes'
import {
  DEFAULT_THEME,
  DEFAULT_THEME_COLOR,
  getThemeColorDefinition,
  isThemeColorId,
  isThemeModeId,
  type ThemeColorId,
  type ThemeModeId,
} from '@/config/theme-registry'
import { createTranslator } from '@/i18n/messages'

function getPageFromPathname(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  return segments[2]
}

export function useRouteContext() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const lang: SupportedLang = isSupportedLang(params.lang) ? params.lang : DEFAULT_LANG
  const chain: SupportedChainKey = isSupportedChain(params.chain) ? params.chain : DEFAULT_CHAIN
  const rawPage = getPageFromPathname(location.pathname)
  const page: SupportedPageKey = isSupportedPage(rawPage) ? rawPage : DEFAULT_PAGE
  const rawTheme = searchParams.get('theme')
  const rawThemeColor = searchParams.get('themeColor')
  const theme: ThemeModeId = isThemeModeId(rawTheme ?? undefined) ? (rawTheme as ThemeModeId) : DEFAULT_THEME
  const themeColor: ThemeColorId = isThemeColorId(rawThemeColor ?? undefined)
    ? (rawThemeColor as ThemeColorId)
    : DEFAULT_THEME_COLOR
  const chainDefinition = getChainDefinition(chain)
  const themeColorDefinition = getThemeColorDefinition(themeColor)
  const t = useMemo(() => createTranslator(lang), [lang])

  function navigateToPage(
    nextPage: SupportedPageKey,
    options?: {
      nextLang?: SupportedLang
      nextChain?: SupportedChainKey
      nextTheme?: ThemeModeId
      nextThemeColor?: ThemeColorId
    },
  ) {
    navigate(
      buildPagePath(options?.nextLang ?? lang, options?.nextChain ?? chain, nextPage, {
        theme: options?.nextTheme ?? theme,
        themeColor: options?.nextThemeColor ?? themeColor,
      }),
    )
  }

  return {
    lang,
    chain,
    page,
    theme,
    themeColor,
    t,
    chainDefinition,
    themeColorDefinition,
    navigateToPage,
  }
}
