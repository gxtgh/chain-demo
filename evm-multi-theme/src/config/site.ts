import { buildPagePath } from './routes'
import { supportedLanguages, type SupportedChainKey, type SupportedLang, type SupportedPageKey } from './chains'

const fallbackSiteUrl = 'http://localhost:5174'

export const SITE_NAME = 'Web3 Token'
export const SUPPORT_EMAIL = 'support@create-solana-token.com'
export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL ?? fallbackSiteUrl)
export const DEFAULT_OG_IMAGE = '/img/common/logo-orange.png'

export function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, '')
}

export function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, `${SITE_URL}/`).toString()
}

export function buildCanonicalPageUrl(lang: SupportedLang, chain: SupportedChainKey, page: SupportedPageKey) {
  return buildAbsoluteUrl(buildPagePath(lang, chain, page))
}

export function normalizeLocaleTag(lang: SupportedLang) {
  return lang === 'zh-cn' ? 'zh-CN' : 'en-US'
}

export function buildAlternatePageLinks(chain: SupportedChainKey, page: SupportedPageKey) {
  return [
    ...supportedLanguages.map((language) => ({
      hrefLang: language.key,
      href: buildCanonicalPageUrl(language.key, chain, page),
    })),
    {
      hrefLang: 'x-default',
      href: buildCanonicalPageUrl('en-us', chain, page),
    },
  ]
}
