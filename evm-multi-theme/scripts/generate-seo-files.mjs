import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadEnv } from 'vite'

const fallbackSiteUrl = 'http://localhost:5174'
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'production'
const env = loadEnv(mode, process.cwd(), '')
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? fallbackSiteUrl)
const outputDir = path.resolve(process.cwd(), 'public')

const languages = ['en-us', 'zh-cn']
const publicChains = ['bsc', 'eth', 'base']
const publicPages = ['token-creation', 'tax-token-creation']

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '')
}

function buildPagePath(lang, chain, page) {
  return `/${lang}/${chain}/${page}`
}

function buildAbsoluteUrl(pathname) {
  return `${siteUrl}${pathname}`
}

function buildSitemapXml() {
  const entries = []

  for (const chain of publicChains) {
    for (const page of publicPages) {
      for (const lang of languages) {
        const canonicalPath = buildPagePath(lang, chain, page)
        const alternates = languages
          .map((altLang) => {
            const href = buildAbsoluteUrl(buildPagePath(altLang, chain, page))
            return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${href}" />`
          })
          .join('\n')

        entries.push(`  <url>
    <loc>${buildAbsoluteUrl(canonicalPath)}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${buildAbsoluteUrl(buildPagePath('en-us', chain, page))}" />
  </url>`)
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}
`
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'sitemap.xml'), buildSitemapXml(), 'utf8')
  await writeFile(path.join(outputDir, 'robots.txt'), buildRobotsTxt(), 'utf8')
}

await main()
