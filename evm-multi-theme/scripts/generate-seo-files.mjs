import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { loadEnv } from 'vite'

const fallbackSiteUrl = 'http://localhost:5174'
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'production'
const env = loadEnv(mode, process.cwd(), '')
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? fallbackSiteUrl)
const outputDir = path.resolve(process.cwd(), 'public')
const chainsConfigPath = path.resolve(process.cwd(), 'src/config/chains.ts')
const routesConfigPath = path.resolve(process.cwd(), 'src/config/routes.ts')

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '')
}

function buildPagePath(lang, chain, page) {
  return page === 'home' ? `/${lang}/${chain}` : `/${lang}/${chain}/${page}`
}

function buildAbsoluteUrl(pathname) {
  return `${siteUrl}${pathname}`
}

async function loadSourceFile(filePath) {
  const content = await readFile(filePath, 'utf8')
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
}

function findVariableDeclaration(sourceFile, name) {
  let declaration

  function visit(node) {
    if (declaration) {
      return
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      declaration = node
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return declaration
}

function getPropertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) {
    return name.text
  }

  return null
}

function findObjectProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const name = getPropertyNameText(property.name)
    if (name === propertyName) {
      return property.initializer
    }
  }

  return null
}

function readStringLiteral(expression) {
  return ts.isStringLiteralLike(expression) ? expression.text : null
}

function readBooleanLiteral(expression) {
  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return true
  }

  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return false
  }

  return null
}

function readStringArray(expression) {
  if (!ts.isArrayLiteralExpression(expression)) {
    return null
  }

  return expression.elements
    .map((element) => readStringLiteral(element))
    .filter((value) => typeof value === 'string')
}

async function readChainSeoConfig() {
  const sourceFile = await loadSourceFile(chainsConfigPath)
  const languagesDeclaration = findVariableDeclaration(sourceFile, 'supportedLanguages')
  const chainsDeclaration = findVariableDeclaration(sourceFile, 'supportedChainsBase')

  if (!languagesDeclaration?.initializer || !ts.isArrayLiteralExpression(languagesDeclaration.initializer)) {
    throw new Error('Unable to read supportedLanguages from src/config/chains.ts')
  }

  if (!chainsDeclaration?.initializer || !ts.isArrayLiteralExpression(chainsDeclaration.initializer)) {
    throw new Error('Unable to read supportedChainsBase from src/config/chains.ts')
  }

  const languages = languagesDeclaration.initializer.elements
    .filter(ts.isObjectLiteralExpression)
    .map((element) => readStringLiteral(findObjectProperty(element, 'key')))
    .filter((value) => typeof value === 'string')

  const enabledChainKeys = []
  const seoChainKeys = []

  for (const element of chainsDeclaration.initializer.elements) {
    if (!ts.isObjectLiteralExpression(element)) {
      continue
    }

    const key = readStringLiteral(findObjectProperty(element, 'key'))
    const isEnable = readBooleanLiteral(findObjectProperty(element, 'isEnable'))
    const seoIndex = readBooleanLiteral(findObjectProperty(element, 'seoIndex'))

    if (!key || !isEnable) {
      continue
    }

    enabledChainKeys.push(key)

    if (seoIndex) {
      seoChainKeys.push(key)
    }
  }

  return {
    languages,
    enabledChainKeys,
    seoChainKeys,
  }
}

async function readPageRouteConfigs(enabledChainKeys) {
  const sourceFile = await loadSourceFile(routesConfigPath)
  const routesDeclaration = findVariableDeclaration(sourceFile, 'pageRouteConfigs')

  if (!routesDeclaration?.initializer || !ts.isObjectLiteralExpression(routesDeclaration.initializer)) {
    throw new Error('Unable to read pageRouteConfigs from src/config/routes.ts')
  }

  const pageConfigs = []

  for (const property of routesDeclaration.initializer.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const page = getPropertyNameText(property.name)
    if (!page || !ts.isObjectLiteralExpression(property.initializer)) {
      continue
    }

    const chainKeysExpression = findObjectProperty(property.initializer, 'chainKeys')
    const chainKeys = readStringArray(chainKeysExpression) ?? [...enabledChainKeys]

    pageConfigs.push({
      page,
      chainKeys,
    })
  }

  return pageConfigs
}

async function loadSeoRoutes() {
  const { languages, enabledChainKeys, seoChainKeys } = await readChainSeoConfig()
  const pageConfigs = await readPageRouteConfigs(enabledChainKeys)
  const seoChainSet = new Set(seoChainKeys)

  return pageConfigs.flatMap(({ page, chainKeys }) =>
    chainKeys
      .filter((chainKey, index) => chainKeys.indexOf(chainKey) === index && seoChainSet.has(chainKey))
      .flatMap((chainKey) =>
        languages.map((lang) => ({
          lang,
          chain: chainKey,
          page,
          pathname: buildPagePath(lang, chainKey, page),
        })),
      ),
  )
}

function buildSitemapXml(routes, languages) {
  const entries = routes.map(({ lang, chain, page, pathname }) => {
    const alternates = languages
      .map((alternateLang) => {
        const href = buildAbsoluteUrl(buildPagePath(alternateLang, chain, page))
        return `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${href}" />`
      })
      .join('\n')

    return `  <url>
    <loc>${buildAbsoluteUrl(pathname)}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${buildAbsoluteUrl(buildPagePath('en-us', chain, page))}" />
  </url>`
  })

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
  const routes = await loadSeoRoutes()
  const languages = [...new Set(routes.map((route) => route.lang))]

  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'sitemap.xml'), buildSitemapXml(routes, languages), 'utf8')
  await writeFile(path.join(outputDir, 'robots.txt'), buildRobotsTxt(), 'utf8')
}

await main()
