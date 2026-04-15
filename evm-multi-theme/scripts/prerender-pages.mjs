import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const clientDistDir = path.resolve(process.cwd(), 'dist')
const serverBuildDir = path.resolve(process.cwd(), '.prerender')
const serverEntryPath = path.join(serverBuildDir, 'entry-server.js')

const template = await readFile(path.join(clientDistDir, 'index.html'), 'utf8')
const { prerenderRoutes, render } = await import(pathToFileURL(serverEntryPath).href)
const redirectRules = []

for (const route of prerenderRoutes) {
  const { appHtml, headTags, htmlLang, title } = render(route)
  const routeHtml = template
    .replace(/<html lang="[^"]*">/, `<html lang="${htmlLang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', `${headTags ? `    ${headTags}\n` : ''}  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

  const outputFilePath =
    route === '/'
      ? path.join(clientDistDir, 'index.html')
      : path.join(clientDistDir, `${route.replace(/^\//, '')}.html`)
  await mkdir(path.dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, routeHtml, 'utf8')
  if (route !== '/') {
    redirectRules.push(`${route}/ ${route} 301`)
  }
}

if (redirectRules.length > 0) {
  await writeFile(path.join(clientDistDir, '_redirects'), `${redirectRules.join('\n')}\n`, 'utf8')
}

await rm(serverBuildDir, { recursive: true, force: true })

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
