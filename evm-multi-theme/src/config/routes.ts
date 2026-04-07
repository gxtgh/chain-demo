import {
  DEFAULT_CHAIN,
  DEFAULT_LANG,
  DEFAULT_PAGE,
  supportedChains,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from './chains'
import { DEFAULT_THEME, DEFAULT_THEME_COLOR, type ThemeColorId, type ThemeModeId } from './theme-registry'

export type PageRouteConfig = {
  page: SupportedPageKey
  chainKeys: SupportedChainKey[]
}

export const pageRouteConfigs: Record<SupportedPageKey, PageRouteConfig> = {
  'token-creation': {
    page: 'token-creation',
    chainKeys: [
      'eth',
      'bsc',
      'bsc-testnet',
      'base',
      'x-layer',
      'plasma',
      'monad',
      'polygon',
      'avalanche',
      'arbitrum',
      'optimism',
      'sonic',
      'unichain',
      'hyperevm',
      'linea',
      // 'mantle',
      'blast',
      'scroll',
      // 'metis',
      // 'cronos',
      // 'pulse',
      'core',
      'gate-layer',
    ],
  },
  'tax-token-creation': {
    page: 'tax-token-creation',
    chainKeys: [
      'eth',
      'bsc',
      'bsc-testnet',
      'base',
      'x-layer',
      'plasma',
      'monad',
      'polygon',
      'avalanche',
      'arbitrum',
      'optimism',
      'sonic',
      'unichain',
      'hyperevm',
      'linea',
      // 'mantle',
      'blast',
      'scroll',
      // 'metis',
      // 'cronos',
      // 'pulse',
      'core',
      'gate-layer',
    ],
  },
  'project-acceptance': {
    page: 'project-acceptance',
    chainKeys: ['bsc', 'eth', 'base'],
  },
}

export function getPageSupportedChainKeys(page: SupportedPageKey) {
  const enabledChainKeys = new Set(supportedChains.map((chain) => chain.key))
  return pageRouteConfigs[page].chainKeys.filter((chainKey) => enabledChainKeys.has(chainKey))
}

export function getPageSupportedChains(page: SupportedPageKey) {
  const pageChainKeys = new Set(getPageSupportedChainKeys(page))
  return supportedChains.filter((chain) => pageChainKeys.has(chain.key))
}

export function isPageChainSupported(page: SupportedPageKey, chain: SupportedChainKey) {
  return getPageSupportedChainKeys(page).includes(chain)
}

export function resolvePageChain(page: SupportedPageKey, chain: SupportedChainKey = DEFAULT_CHAIN) {
  if (isPageChainSupported(page, chain)) {
    return chain
  }

  return getPageSupportedChainKeys(page)[0] ?? DEFAULT_CHAIN
}

export function buildPagePath(
  lang: SupportedLang = DEFAULT_LANG,
  chain: SupportedChainKey = DEFAULT_CHAIN,
  page: SupportedPageKey = DEFAULT_PAGE,
  options?: { theme?: ThemeModeId; themeColor?: ThemeColorId },
) {
  const resolvedChain = resolvePageChain(page, chain)
  const search = new URLSearchParams()
  if (options?.theme && options.theme !== DEFAULT_THEME) {
    search.set('theme', options.theme)
  }
  if (options?.themeColor && options.themeColor !== DEFAULT_THEME_COLOR) {
    search.set('themeColor', options.themeColor)
  }
  const query = search.toString()
  return `/${lang}/${resolvedChain}/${page}${query ? `?${query}` : ''}`
}

export function buildDefaultPath() {
  return buildPagePath(DEFAULT_LANG, DEFAULT_CHAIN, DEFAULT_PAGE)
}
