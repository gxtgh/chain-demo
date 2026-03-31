export type ThemeModeId = 'light' | 'dark'
export type ThemeColorId = 'orange' | 'purple' | 'green'

export type ThemeModeDefinition = {
  id: ThemeModeId
  label: string
}

export type ThemeColorDefinition = {
  id: ThemeColorId
  label: string
  accent: string
  mood: string
}

export const DEFAULT_THEME: ThemeModeId = 'light'
export const DEFAULT_THEME_COLOR: ThemeColorId = 'orange'

export const themeModeRegistry: ThemeModeDefinition[] = [
  {
    id: 'light',
    label: 'Light',
  },
  {
    id: 'dark',
    label: 'Dark',
  },
]

export const themeColorRegistry: ThemeColorDefinition[] = [
  {
    id: 'orange',
    label: 'Orange',
    accent: '#ff6b2d',
    mood: 'Utility-first token creator',
  },
  {
    id: 'purple',
    label: 'Purple',
    accent: '#8b5cf6',
    mood: 'Editorial launch theme',
  },
  {
    id: 'green',
    label: 'Green',
    accent: '#1dbf73',
    mood: 'Control room dashboard',
  },
]

export function isThemeModeId(value?: string): value is ThemeModeId {
  return themeModeRegistry.some((theme) => theme.id === value)
}

export function isThemeColorId(value?: string): value is ThemeColorId {
  return themeColorRegistry.some((theme) => theme.id === value)
}

export function getThemeColorDefinition(themeId: ThemeColorId) {
  return themeColorRegistry.find((theme) => theme.id === themeId) ?? themeColorRegistry[0]
}
