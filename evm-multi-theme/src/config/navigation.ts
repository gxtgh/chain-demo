import type { SupportedPageKey } from './chains'

export type NavigationItem = {
  page: SupportedPageKey
  titleKey: 'nav.tokenCreation' | 'nav.projectAcceptance'
  slug: string
}

export const navigationItems: NavigationItem[] = [
  {
    page: 'token-creation',
    titleKey: 'nav.tokenCreation',
    slug: 'token-creation',
  },
]
