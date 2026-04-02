import { bsc, bscTestnet, mainnet, base } from 'wagmi/chains'
import type { Chain } from 'viem'

export type SupportedLang = 'en-us' | 'zh-cn'
export type SupportedChainKey = 'bsc' | 'bsc-testnet' | 'eth' | 'base'
export type SupportedPageKey = 'token-creation' | 'project-acceptance'

export type TokenMeta = {
  address: string
  symbol: string
  decimals: number
  logo: string
}

export type ContractMeta = {
  key: string
  label: string
  dex?: string
  version?: string
  address: `0x${string}`
}

export type ChainDefinition = {
  isEnable: boolean
  key: SupportedChainKey
  chainId: number
  network: Chain
  defaultChain?: boolean
  EIP1559: boolean
  name: string
  fullName: string
  icon: string
  tokenType: string
  deployUrl?: string
  rpcList: string[]
  explorerBaseUrl: string
  nativeToken: TokenMeta
  wtoken: TokenMeta
  contractList: ContractMeta[]
}

export const DEFAULT_LANG: SupportedLang = 'en-us'
export const DEFAULT_CHAIN: SupportedChainKey = 'bsc'
export const DEFAULT_PAGE: SupportedPageKey = 'token-creation'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export const supportedLanguages: Array<{ key: SupportedLang; label: string }> = [
  { key: 'en-us', label: 'English' },
  { key: 'zh-cn', label: '简体中文' },
]

export const supportedChains: ChainDefinition[] = [
  {
    isEnable: true,
    key: 'bsc',
    chainId: 56,
    network: bsc,
    defaultChain: true,
    EIP1559: false,
    name: 'BSC',
    fullName: 'BNB Smart Chain',
    icon: '/img/chain/bsc.svg',
    tokenType: 'BEP20',
    deployUrl: '',
    rpcList: ['https://bnb-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    explorerBaseUrl: 'https://bscscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      symbol: 'BNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    wtoken: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      symbol: 'WBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x78B84D2A29eA3e199aB81C48B687630AEA124A33' },
    ],
  },
  {
    isEnable: true,
    key: 'bsc-testnet',
    chainId: 97,
    network: bscTestnet,
    EIP1559: false,
    name: 'BSC Testnet',
    fullName: 'BNB Smart Chain Testnet',
    icon: '/img/chain/bsc.svg',
    tokenType: 'BEP20',
    deployUrl: '',
    rpcList: ['https://bnb-testnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    explorerBaseUrl: 'https://testnet.bscscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      symbol: 'tBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    wtoken: {
      address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      symbol: 'WBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x1C47E37f13299d9989587edCb3875c5FcED57E99' },
    ],
  },
  {
    isEnable: true,
    key: 'eth',
    chainId: 1,
    network: mainnet,
    EIP1559: true,
    name: 'ETH',
    fullName: 'Ethereum',
    icon: '/img/chain/eth.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: ['https://eth-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    explorerBaseUrl: 'https://etherscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/eth.svg',
    },
    wtoken: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449' },
    ],
  },
  {
    isEnable: true,
    key: 'base',
    chainId: 8453,
    network: base,
    EIP1559: true,
    name: 'BASE',
    fullName: 'Base',
    icon: '/img/chain/base.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: ['https://base-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    explorerBaseUrl: 'https://basescan.org',
    nativeToken: {
      address: ZERO_ADDRESS,
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/base.svg',
    },
    wtoken: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x4D09F42905E7481d3A8E39AB8777170f6D598A3b' },
    ],
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

export function getChainFullName(chain: ChainDefinition) {
  return chain.fullName
}

export function getChainRpcUrl(chain: ChainDefinition) {
  return chain.rpcList[0] ?? ''
}

export function getChainContractAddress(chain: ChainDefinition, contractKey: string) {
  return chain.contractList.find((contract) => contract.key === contractKey)?.address
}
