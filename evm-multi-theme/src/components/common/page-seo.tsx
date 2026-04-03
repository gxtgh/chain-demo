import { useEffect } from 'react'
import type { SeoDefinition } from '@/config/seo'
import { DEFAULT_OG_IMAGE, SITE_NAME, buildAbsoluteUrl } from '@/config/site'

function upsertMetaByName(name: string, content?: string) {
  if (!content) return

  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.name = name
    document.head.appendChild(element)
  }

  element.content = content
}

function upsertMetaByProperty(property: string, content?: string) {
  if (!content) return

  let element = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }

  element.content = content
}

function upsertCanonical(href?: string) {
  if (!href) return

  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

function syncAlternateLinks(alternates: NonNullable<SeoDefinition['alternates']>) {
  document.head.querySelectorAll('link[data-seo-alternate="true"]').forEach((element) => element.remove())

  alternates.forEach((alternate) => {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = alternate.hrefLang
    link.href = alternate.href
    link.setAttribute('data-seo-alternate', 'true')
    document.head.appendChild(link)
  })
}

export function PageSeo({
  title,
  description,
  keywords,
  robots = 'index,follow',
  canonicalUrl,
  image = buildAbsoluteUrl(DEFAULT_OG_IMAGE),
  type = 'website',
  locale,
  alternates,
}: SeoDefinition) {
  useEffect(() => {
    document.title = title
    upsertMetaByName('description', description)
    upsertMetaByName('keywords', keywords)
    upsertMetaByName('robots', robots)
    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:title', title)
    upsertMetaByName('twitter:description', description)
    upsertMetaByName('twitter:image', image)

    upsertMetaByProperty('og:site_name', SITE_NAME)
    upsertMetaByProperty('og:type', type)
    upsertMetaByProperty('og:title', title)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:url', canonicalUrl)
    upsertMetaByProperty('og:image', image)
    upsertMetaByProperty('og:locale', locale)

    upsertCanonical(canonicalUrl)

    if (alternates?.length) {
      syncAlternateLinks(alternates)
    } else {
      document.head.querySelectorAll('link[data-seo-alternate="true"]').forEach((element) => element.remove())
    }

    if (locale) {
      document.documentElement.lang = locale
    }
  }, [alternates, canonicalUrl, description, image, keywords, locale, robots, title, type])

  return null
}
