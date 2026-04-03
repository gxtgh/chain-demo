import type { SupportedPageKey } from './chains'

export type SeoDefinition = {
  title: string
  description: string
  keywords?: string
  robots?: string
  canonicalUrl?: string
  image?: string
  type?: 'website' | 'article'
  locale?: string
  alternates?: Array<{
    hrefLang: string
    href: string
  }>
}

export type SeoContext = {
  t: (key: string, vars?: Record<string, string | number>) => string
  chainName: string
  tokenType: string
  nativeSymbol?: string
}

export function getPageSeo(page: SupportedPageKey, context: SeoContext): SeoDefinition {
  if (page === 'token-creation') {
    return {
      title: context.t('tokenCreation.seo.title', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
      description: context.t('tokenCreation.seo.description', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
      keywords: context.t('tokenCreation.seo.keywords', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
    }
  }

  if (page === 'tax-token-creation') {
    return {
      title: context.t('tokenTaxCreation.seo.title', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
      description: context.t('tokenTaxCreation.seo.description', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
      keywords: context.t('tokenTaxCreation.seo.keywords', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
    }
  }

  return {
    title: context.t('acceptance.seo.title', { chain: context.chainName }),
    description: context.t('acceptance.seo.description', { chain: context.chainName }),
    keywords: context.t('acceptance.seo.keywords', { chain: context.chainName }),
  }
}
