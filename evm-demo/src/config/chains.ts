export type SupportedLang = 'en-us' | 'zh-cn'
export type SupportedChainKey = 'bsc' | 'eth' | 'base'
export type SupportedPageKey = 'create-token' | 'create-tax-token' | 'okx-trade-test'

export type ChainConfig = {
  key: SupportedChainKey
  name: string
  chainId: number
  rpcUrls: string[]
  blockExplorerUrls: string[]
  icon: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const DEFAULT_PAGE: SupportedPageKey = 'create-token'
export const DEFAULT_CHAIN: SupportedChainKey = 'bsc'
export const DEFAULT_LANG: SupportedLang = 'en-us'

export const supportedChains: ChainConfig[] = [
  {
    key: 'bsc',
    name: 'BNB Smart Chain',
    chainId: 56,
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    icon: 'BNB',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  {
    key: 'eth',
    name: 'Ethereum',
    chainId: 1,
    rpcUrls: ['https://ethereum-rpc.publicnode.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    icon: 'ETH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    key: 'base',
    name: 'Base',
    chainId: 8453,
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    icon: 'BASE',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
]

export const supportedLanguages: Array<{ key: SupportedLang; label: string }> = [
  { key: 'en-us', label: 'English' },
  { key: 'zh-cn', label: '简体中文' },
]

export function getChainConfig(chainKey: string) {
  return supportedChains.find((chain) => chain.key === chainKey) ?? supportedChains[0]
}

export function isSupportedPageKey(page: string): page is SupportedPageKey {
  return page === 'create-token' || page === 'create-tax-token' || page === 'okx-trade-test'
}

export function isSupportedChainKey(chain: string): chain is SupportedChainKey {
  return supportedChains.some((item) => item.key === chain)
}

export function isSupportedLang(lang: string): lang is SupportedLang {
  return supportedLanguages.some((item) => item.key === lang)
}
