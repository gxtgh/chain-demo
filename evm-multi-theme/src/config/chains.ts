export type SupportedLang = 'en-us' | 'zh-cn'
export type SupportedChainKey = 'bsc' | 'eth' | 'base'
export type SupportedPageKey = 'token-creation' | 'project-acceptance'

export type ChainDefinition = {
  key: SupportedChainKey
  chainId: number
  name: string
  shortName: string
  icon: string
  tokenType: string
  rpcUrl: string
  explorerBaseUrl: string
  nativeSymbol: string
  factoryAddress: `0x${string}`
}

export const DEFAULT_LANG: SupportedLang = 'en-us'
export const DEFAULT_CHAIN: SupportedChainKey = 'bsc'
export const DEFAULT_PAGE: SupportedPageKey = 'token-creation'

export const supportedLanguages: Array<{ key: SupportedLang; label: string }> = [
  { key: 'en-us', label: 'English' },
  { key: 'zh-cn', label: '简体中文' },
]

export const supportedChains: ChainDefinition[] = [
  {
    key: 'bsc',
    chainId: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    icon: '/img/chain/bsc.svg',
    tokenType: 'BEP20',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerBaseUrl: 'https://bscscan.com',
    nativeSymbol: 'BNB',
    factoryAddress: '0x78B84D2A29eA3e199aB81C48B687630AEA124A33',
  },
  {
    key: 'eth',
    chainId: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    icon: '/img/chain/eth.svg',
    tokenType: 'ERC20',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorerBaseUrl: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    factoryAddress: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449',
  },
  {
    key: 'base',
    chainId: 8453,
    name: 'Base',
    shortName: 'BASE',
    icon: '/img/chain/base.svg',
    tokenType: 'ERC20',
    rpcUrl: 'https://mainnet.base.org',
    explorerBaseUrl: 'https://basescan.org',
    nativeSymbol: 'ETH',
    factoryAddress: '0x4D09F42905E7481d3A8E39AB8777170f6D598A3b',
  },
]

export function isSupportedLang(value?: string): value is SupportedLang {
  return supportedLanguages.some((language) => language.key === value)
}

export function isSupportedChain(value?: string): value is SupportedChainKey {
  return supportedChains.some((chain) => chain.key === value)
}

export function isSupportedPage(value?: string): value is SupportedPageKey {
  return value === 'token-creation' || value === 'project-acceptance'
}

export function getChainDefinition(chainKey: SupportedChainKey) {
  return supportedChains.find((chain) => chain.key === chainKey) ?? supportedChains[0]
}
