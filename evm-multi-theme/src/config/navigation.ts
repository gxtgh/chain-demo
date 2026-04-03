import type { SupportedPageKey } from './chains'

export type NavigationItem = {
  page: SupportedPageKey
  titleKey: 'nav.tokenCreation' | 'nav.tokenTaxCreation' | 'nav.projectAcceptance'
  slug: string
}

export const navigationItems: NavigationItem[] = [
  {
    page: 'token-creation',
    titleKey: 'nav.tokenCreation',
    slug: 'token-creation',
  },
  {
    page: 'tax-token-creation',
    titleKey: 'nav.tokenTaxCreation',
    slug: 'tax-token-creation',
  },
]
