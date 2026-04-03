import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  DEFAULT_PAGE,
  getChainDefinition,
  isSupportedPage,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from '@/config/chains'
import { buildPagePath } from '@/config/routes'
import {
  getThemeColorDefinition,
  type ThemeColorId,
  type ThemeModeId,
} from '@/config/theme-registry'
import { createTranslator } from '@/i18n/messages'
import {
  rememberSessionPreferences,
  rememberUserPreferences,
  resolveAppPreferences,
  type PreferencePersistenceMode,
} from './preferences'

function getPageFromPathname(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  return segments[2]
}

export function useRouteContext() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawTheme = searchParams.get('theme')
  const rawThemeColor = searchParams.get('themeColor')
  const resolvedPreferences = useMemo(
    () =>
      resolveAppPreferences({
        lang: params.lang,
        chain: params.chain,
        theme: rawTheme,
        themeColor: rawThemeColor,
      }),
    [params.chain, params.lang, rawTheme, rawThemeColor],
  )

  const lang: SupportedLang = resolvedPreferences.lang
  const chain: SupportedChainKey = resolvedPreferences.chain
  const rawPage = getPageFromPathname(location.pathname)
  const page: SupportedPageKey = isSupportedPage(rawPage) ? rawPage : DEFAULT_PAGE
  const hasThemeQuery = Boolean(rawTheme || rawThemeColor)
  const theme: ThemeModeId = resolvedPreferences.theme
  const themeColor: ThemeColorId = resolvedPreferences.themeColor
  const chainDefinition = getChainDefinition(chain)
  const themeColorDefinition = getThemeColorDefinition(themeColor)
  const t = useMemo(() => createTranslator(lang), [lang])

  useEffect(() => {
    rememberSessionPreferences({
      lang,
      chain,
      theme,
      themeColor,
    })
  }, [chain, lang, theme, themeColor])

  function navigateToPage(
    nextPage: SupportedPageKey,
    options?: {
      nextLang?: SupportedLang
      nextChain?: SupportedChainKey
      nextTheme?: ThemeModeId
      nextThemeColor?: ThemeColorId
      replace?: boolean
      persist?: PreferencePersistenceMode
    },
  ) {
    const nextPreferences = {
      lang: options?.nextLang ?? lang,
      chain: options?.nextChain ?? chain,
      theme: options?.nextTheme ?? theme,
      themeColor: options?.nextThemeColor ?? themeColor,
    }

    if (options?.persist === 'session') {
      rememberSessionPreferences(nextPreferences)
    } else if ((options?.persist ?? 'session+local') === 'session+local') {
      rememberUserPreferences(nextPreferences)
    }

    navigate(
      buildPagePath(nextPreferences.lang, nextPreferences.chain, nextPage, {
        theme: nextPreferences.theme,
        themeColor: nextPreferences.themeColor,
      }),
      { replace: options?.replace ?? false },
    )
  }

  return {
    lang,
    chain,
    page,
    theme,
    themeColor,
    hasThemeQuery,
    t,
    chainDefinition,
    themeColorDefinition,
    navigateToPage,
  }
}
