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
  if (page === 'home') {
    return {
      title: context.t('home.seo.title', {
        chain: context.chainName,
      }),
      description: context.t('home.seo.description', {
        chain: context.chainName,
      }),
      keywords: context.t('home.seo.keywords', {
        chain: context.chainName,
      }),
    }
  }

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

  if (page === 'token-dividend-creation') {
    return {
      title: context.t('tokenDividendCreation.seo.title', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
      description: context.t('tokenDividendCreation.seo.description', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
      keywords: context.t('tokenDividendCreation.seo.keywords', {
        chain: context.chainName,
        tokenType: context.tokenType,
        symbol: context.nativeSymbol ?? '',
      }),
    }
  }

  if (page === 'token-vanity-creation') {
    return {
      title: context.t('tokenVanityCreation.seo.title', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
      description: context.t('tokenVanityCreation.seo.description', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
      keywords: context.t('tokenVanityCreation.seo.keywords', {
        chain: context.chainName,
        tokenType: context.tokenType,
      }),
    }
  }

  throw new Error(`Unsupported SEO page: ${page satisfies never}`)
}
