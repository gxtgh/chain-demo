import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppFrame } from '@/app/app-frame'
import { AppRouter } from '@/app/router'
import {
  getChainDefinition,
  getChainFullName,
  isSupportedChain,
  isSupportedLang,
  supportedLanguages,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from '@/config/chains'
import { getPageSupportedChains, isPageChainSupported } from '@/config/routes'
import { getPageSeo } from '@/config/seo'
import { DEFAULT_OG_IMAGE, SITE_NAME, buildAbsoluteUrl, buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import { buildTokenCreationFaqStructuredData, getTokenCreationFaqVars } from '@/features/tokenCreation/shared/token-creation-seo-data'
import { buildTokenTaxFaqStructuredData, getTokenTaxFaqVars } from '@/features/tokenTaxCreation/shared/token-tax-seo-data'
import { buildTokenVanityFaqStructuredData, getTokenVanityFaqVars } from '@/features/tokenVanityCreation/shared/token-vanity-seo-data'
import { createTranslator } from '@/i18n/messages'

export const prerenderRoutes = supportedLanguages.flatMap((language) =>
  (['home', 'token-creation', 'tax-token-creation', 'token-vanity-creation'] as const).flatMap((page) =>
    getPageSupportedChains(page)
      .filter((chain) => chain.seoIndex)
      .map((chain) => (page === 'home' ? `/${language.key}/${chain.key}` : `/${language.key}/${chain.key}/${page}`)),
  ),
)

export function render(url: string) {
  const appHtml = renderToString(
    <StaticRouter location={url}>
      <AppFrame mode="static">
        <AppRouter />
      </AppFrame>
    </StaticRouter>,
  )

  const document = buildDocument(url)

  return {
    appHtml,
    ...document,
  }
}

function buildDocument(url: string) {
  const route = resolvePublicRoute(url)

  if (!route) {
    return {
      htmlLang: 'en',
      title: SITE_NAME,
      headTags: '',
    }
  }

  const t = createTranslator(route.lang)
  const chainDefinition = getChainDefinition(route.chain)
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo(route.page, {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
    nativeSymbol: chainDefinition.nativeToken.symbol,
  })
  const canonicalUrl = buildCanonicalPageUrl(route.lang, route.chain, route.page)
  const imageUrl = buildAbsoluteUrl(DEFAULT_OG_IMAGE)
  const alternates = buildAlternatePageLinks(route.chain, route.page)
  const faqStructuredData =
    route.page === 'tax-token-creation'
      ? buildTokenTaxFaqStructuredData(t, getTokenTaxFaqVars(chainDefinition, chainLabel))
      : route.page === 'token-vanity-creation'
        ? buildTokenVanityFaqStructuredData(t, getTokenVanityFaqVars(chainDefinition, chainLabel))
      : route.page === 'token-creation'
        ? buildTokenCreationFaqStructuredData(t, getTokenCreationFaqVars(chainDefinition, chainLabel))
        : null

  const headTags = [
    buildMetaTag('description', seo.description),
    seo.keywords ? buildMetaTag('keywords', seo.keywords) : '',
    buildMetaTag('robots', 'index,follow'),
    buildMetaTag('twitter:card', 'summary_large_image'),
    buildMetaTag('twitter:title', seo.title),
    buildMetaTag('twitter:description', seo.description),
    buildMetaTag('twitter:image', imageUrl),
    buildPropertyMetaTag('og:site_name', SITE_NAME),
    buildPropertyMetaTag('og:type', 'website'),
    buildPropertyMetaTag('og:title', seo.title),
    buildPropertyMetaTag('og:description', seo.description),
    buildPropertyMetaTag('og:url', canonicalUrl),
    buildPropertyMetaTag('og:image', imageUrl),
    buildPropertyMetaTag('og:locale', normalizeLocaleTag(route.lang)),
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    ...alternates.map(
      (alternate) => `<link rel="alternate" hreflang="${escapeAttribute(alternate.hrefLang)}" href="${escapeAttribute(alternate.href)}" />`,
    ),
    faqStructuredData ? `<script type="application/ld+json">${serializeJsonLd(faqStructuredData)}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ')

  return {
    htmlLang: normalizeLocaleTag(route.lang),
    title: seo.title,
    headTags,
  }
}

function resolvePublicRoute(url: string) {
  const pathname = new URL(url, 'https://token-tools.pages.dev').pathname
  const segments = pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments

  if (
    !isSupportedLang(lang) ||
    !isSupportedChain(chain)
  ) {
    return null
  }

  const resolvedPage =
    page === undefined
      ? 'home'
      : page === 'token-creation' || page === 'tax-token-creation' || page === 'token-vanity-creation'
        ? page
        : null

  if (!resolvedPage) {
    return null
  }

  if (!isPageChainSupported(resolvedPage, chain)) {
    return null
  }

  return {
    lang: lang as SupportedLang,
    chain: chain as SupportedChainKey,
    page: resolvedPage as SupportedPageKey,
  }
}

function buildMetaTag(name: string, content: string) {
  return `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}" />`
}

function buildPropertyMetaTag(property: string, content: string) {
  return `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}" />`
}

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}
