import {
  DEFAULT_CHAIN,
  DEFAULT_LANG,
  isSupportedChain,
  isSupportedLang,
  type SupportedChainKey,
  type SupportedLang,
} from '@/config/chains'
import {
  DEFAULT_THEME,
  DEFAULT_THEME_COLOR,
  isThemeColorId,
  isThemeModeId,
  type ThemeColorId,
  type ThemeModeId,
} from '@/config/theme-registry'

const STORAGE_KEY = 'evm-multi-theme.preferences'

export type AppPreferences = {
  lang: SupportedLang
  chain: SupportedChainKey
  theme: ThemeModeId
  themeColor: ThemeColorId
}

export type PreferenceSource = 'url' | 'session' | 'local' | 'default'

export type ResolvedAppPreferences = AppPreferences & {
  sources: Record<keyof AppPreferences, PreferenceSource>
}

export type PreferencePersistenceMode = 'none' | 'session' | 'session+local'

type PartialPreferences = Partial<AppPreferences>

type RawPreferenceInputs = {
  lang?: string | null
  chain?: string | null
  theme?: string | null
  themeColor?: string | null
}

export function resolveAppPreferences(urlPreferences: RawPreferenceInputs): ResolvedAppPreferences {
  const sessionPreferences = readStoredPreferences('session')
  const localPreferences = readStoredPreferences('local')

  const lang = resolvePreference(
    urlPreferences.lang,
    sessionPreferences.lang,
    localPreferences.lang,
    DEFAULT_LANG,
    isSupportedLang,
  )
  const chain = resolvePreference(
    urlPreferences.chain,
    sessionPreferences.chain,
    localPreferences.chain,
    DEFAULT_CHAIN,
    isSupportedChain,
  )
  const theme = resolvePreference(
    urlPreferences.theme,
    sessionPreferences.theme,
    localPreferences.theme,
    DEFAULT_THEME,
    isThemeModeId,
  )
  const themeColor = resolvePreference(
    urlPreferences.themeColor,
    sessionPreferences.themeColor,
    localPreferences.themeColor,
    DEFAULT_THEME_COLOR,
    isThemeColorId,
  )

  return {
    lang: lang.value,
    chain: chain.value,
    theme: theme.value,
    themeColor: themeColor.value,
    sources: {
      lang: lang.source,
      chain: chain.source,
      theme: theme.source,
      themeColor: themeColor.source,
    },
  }
}

export function rememberSessionPreferences(preferences: PartialPreferences) {
  writeStoredPreferences('session', preferences)
}

export function rememberUserPreferences(preferences: PartialPreferences) {
  const sanitized = sanitizePreferences(preferences)
  writeStoredPreferences('session', sanitized)
  writeStoredPreferences('local', sanitized)
}

function resolvePreference<T extends string>(
  urlValue: string | null | undefined,
  sessionValue: T | undefined,
  localValue: T | undefined,
  fallbackValue: T,
  validator: (value?: string) => value is T,
) {
  if (validator(urlValue ?? undefined)) {
    return { value: urlValue as T, source: 'url' as const }
  }

  if (validator(sessionValue)) {
    return { value: sessionValue as T, source: 'session' as const }
  }

  if (validator(localValue)) {
    return { value: localValue as T, source: 'local' as const }
  }

  return { value: fallbackValue, source: 'default' as const }
}

function sanitizePreferences(preferences: PartialPreferences) {
  const sanitized: PartialPreferences = {}

  if (isSupportedLang(preferences.lang)) {
    sanitized.lang = preferences.lang
  }

  if (isSupportedChain(preferences.chain)) {
    sanitized.chain = preferences.chain
  }

  if (isThemeModeId(preferences.theme)) {
    sanitized.theme = preferences.theme
  }

  if (isThemeColorId(preferences.themeColor)) {
    sanitized.themeColor = preferences.themeColor
  }

  return sanitized
}

function readStoredPreferences(storageType: 'session' | 'local'): PartialPreferences {
  const storage = getSafeStorage(storageType)

  if (!storage) {
    return {}
  }

  try {
    const rawValue = storage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as PartialPreferences
    return sanitizePreferences(parsedValue)
  } catch {
    return {}
  }
}

function writeStoredPreferences(storageType: 'session' | 'local', preferences: PartialPreferences) {
  const storage = getSafeStorage(storageType)

  if (!storage) {
    return
  }

  try {
    const nextPreferences = {
      ...readStoredPreferences(storageType),
      ...sanitizePreferences(preferences),
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences))
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

function getSafeStorage(storageType: 'session' | 'local') {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return storageType === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}
