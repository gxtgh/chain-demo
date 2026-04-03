import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppFrame } from '@/app/app-frame'
import { AppRouter } from '@/app/router'
import {
  getChainDefinition,
  getChainFullName,
  isSupportedChain,
  isSupportedLang,
  supportedChains,
  supportedLanguages,
  type SupportedChainKey,
  type SupportedLang,
} from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { DEFAULT_OG_IMAGE, SITE_NAME, buildAbsoluteUrl, buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import { buildTokenCreationFaqStructuredData, getTokenCreationFaqVars } from '@/features/tokenCreation/shared/token-creation-seo-data'
import { createTranslator } from '@/i18n/messages'

export const prerenderRoutes = supportedLanguages.flatMap((language) =>
  supportedChains.map((chain) => `/${language.key}/${chain.key}/token-creation`),
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
  const route = resolveTokenCreationRoute(url)

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
  const seo = getPageSeo('token-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
  })
  const canonicalUrl = buildCanonicalPageUrl(route.lang, route.chain, 'token-creation')
  const imageUrl = buildAbsoluteUrl(DEFAULT_OG_IMAGE)
  const alternates = buildAlternatePageLinks(route.chain, 'token-creation')
  const faqStructuredData = buildTokenCreationFaqStructuredData(t, getTokenCreationFaqVars(chainDefinition, chainLabel))

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
    `<script type="application/ld+json">${serializeJsonLd(faqStructuredData)}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ')

  return {
    htmlLang: normalizeLocaleTag(route.lang),
    title: seo.title,
    headTags,
  }
}

function resolveTokenCreationRoute(url: string) {
  const pathname = new URL(url, 'https://token-tools.pages.dev').pathname
  const segments = pathname.split('/').filter(Boolean)
  const [lang, chain, page] = segments

  if (!isSupportedLang(lang) || !isSupportedChain(chain) || page !== 'token-creation') {
    return null
  }

  return {
    lang: lang as SupportedLang,
    chain: chain as SupportedChainKey,
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
