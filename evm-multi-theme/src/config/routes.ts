import {
  DEFAULT_CHAIN,
  DEFAULT_LANG,
  DEFAULT_PAGE,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from './chains'
import { DEFAULT_THEME, DEFAULT_THEME_COLOR, type ThemeColorId, type ThemeModeId } from './theme-registry'

export function buildPagePath(
  lang: SupportedLang = DEFAULT_LANG,
  chain: SupportedChainKey = DEFAULT_CHAIN,
  page: SupportedPageKey = DEFAULT_PAGE,
  options?: { theme?: ThemeModeId; themeColor?: ThemeColorId },
) {
  const search = new URLSearchParams()
  if (options?.theme) {
    search.set('theme', options.theme)
  }
  if (options?.themeColor) {
    search.set('themeColor', options.themeColor)
  }
  const query = search.toString()
  return `/${lang}/${chain}/${page}${query ? `?${query}` : ''}`
}

export function buildDefaultPath() {
  return buildPagePath(DEFAULT_LANG, DEFAULT_CHAIN, DEFAULT_PAGE, {
    theme: DEFAULT_THEME,
    themeColor: DEFAULT_THEME_COLOR,
  })
}
