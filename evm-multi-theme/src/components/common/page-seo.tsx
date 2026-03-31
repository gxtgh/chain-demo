import { useEffect } from 'react'
import type { SeoDefinition } from '@/config/seo'

function upsertMeta(name: string, content?: string) {
  if (!content) return

  let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.name = name
    document.head.appendChild(element)
  }

  element.content = content
}

export function PageSeo({ title, description, keywords }: SeoDefinition) {
  useEffect(() => {
    document.title = title
    upsertMeta('description', description)
    upsertMeta('keywords', keywords)
  }, [description, keywords, title])

  return null
}
