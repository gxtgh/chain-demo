import { DEFAULT_LANG, type SupportedLang } from '@/config/chains'
import type { MessageTree } from './message-tree'
import { enUsMessages } from './locales/en-us'
import { zhCnMessages } from './locales/zh-cn'

const messages = {
  'en-us': enUsMessages,
  'zh-cn': zhCnMessages,
} satisfies Record<SupportedLang, MessageTree>

function lookupMessage(tree: MessageTree, path: string) {
  return path.split('.').reduce<string | MessageTree | undefined>((current, key) => {
    if (!current || typeof current === 'string') return current
    return current[key]
  }, tree)
}

export function createTranslator(lang: SupportedLang) {
  return (key: string, vars?: Record<string, string | number>) => {
    const localeTree = messages[lang] ?? messages[DEFAULT_LANG]
    const raw = lookupMessage(localeTree, key)
    if (typeof raw !== 'string') {
      return key
    }
    return Object.entries(vars ?? {}).reduce((message, [token, value]) => {
      return message.replaceAll(`{{${token}}}`, String(value))
    }, raw)
  }
}
