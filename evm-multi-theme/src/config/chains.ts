import { bsc, bscTestnet, mainnet, base } from 'wagmi/chains'
import type { Chain } from 'viem'

export type SupportedLang = 'en-us' | 'zh-cn'
export type SupportedChainKey = 'bsc' | 'bsc-testnet' | 'eth' | 'base'
export type SupportedPageKey = 'token-creation' | 'tax-token-creation' | 'project-acceptance'

export type TokenMeta = {
  address: string
  name?: string
  symbol: string
  decimals: number
  logo?: string
  isNative?: boolean
}

export type ContractMeta = {
  key: string
  label: string
  dex?: string
  version?: string
  address: `0x${string}`
}

export type DexDefinition = {
  type: string
  version?: string
  name: string
  logo?: string
  routerAddress?: `0x${string}`
  factoryAddress?: `0x${string}`
  quoterV2Address?: `0x${string}`
  swapRouterAddress?: `0x${string}`
  rates?: number[]
}

export type ChainDefinition = {
  isEnable: boolean
  key: SupportedChainKey
  chainId: number
  network: Chain
  defaultChain?: boolean
  defaultDex?: string
  EIP1559: boolean
  name: string
  fullName: string
  icon: string
  tokenType: string
  deployUrl?: string
  rpcList: string[]
  dexs?: DexDefinition[]
  explorerBaseUrl: string
  nativeToken: TokenMeta
  wtoken: TokenMeta
  stableCoins?: TokenMeta[]
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
    defaultDex: 'PancakeSwap',
    EIP1559: false,
    name: 'BSC',
    fullName: 'BNB Smart Chain',
    icon: '/img/chain/bsc.svg',
    tokenType: 'BEP20',
    deployUrl: '',
    rpcList: ['https://bnb-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    dexs: [
      {
        type: 'PancakeSwap',
        version: 'v2',
        name: 'PancakeSwap V2',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        rates: [2500],
      },
      {
        type: 'PancakeSwap',
        version: 'v3',
        name: 'PancakeSwap V3',
        routerAddress: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
        factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        quoterV2Address: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
        rates: [100, 500, 2500, 10000],
      },
    ],
    explorerBaseUrl: 'https://bscscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
      isNative: true,
    },
    wtoken: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    stableCoins: [
      {
        name: 'Binance Pegged USDT',
        symbol: 'USDT',
        address: '0x55d398326f99059fF775485246999027B3197955',
        decimals: 18,
      },
      {
        name: 'World Liberty Financial USD',
        symbol: 'USD1',
        address: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d',
        decimals: 18,
      },
      {
        name: 'Binance-Peg USD Coin',
        symbol: 'USDC',
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        decimals: 18,
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x78B84D2A29eA3e199aB81C48B687630AEA124A33' },
      {
        key: 'tokenTaxFactory',
        label: 'Tax Token Creation',
        address: '0x95547365Ef339A7dF41feEB38A4029A9476107Ed',
        dex: 'PancakeSwap',
        version: 'v2',
      },
    ],
  },
  {
    isEnable: true,
    key: 'bsc-testnet',
    chainId: 97,
    network: bscTestnet,
    defaultDex: 'PancakeSwap',
    EIP1559: false,
    name: 'BSC Testnet',
    fullName: 'BNB Smart Chain Testnet',
    icon: '/img/chain/bsc.svg',
    tokenType: 'BEP20',
    deployUrl: '',
    rpcList: ['https://bnb-testnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    dexs: [
      {
        type: 'PancakeSwap',
        version: 'v2',
        name: 'PancakeSwap V2',
        routerAddress: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
        factoryAddress: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
        rates: [2500],
      },
      {
        type: 'PancakeSwap',
        version: 'v3',
        name: 'PancakeSwap V3',
        routerAddress: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
        factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        quoterV2Address: '0xB048BBC1Ee6B733FFfcfb9e9CEF7375518e25997',
        rates: [100, 500, 2500, 10000],
      },
    ],
    explorerBaseUrl: 'https://testnet.bscscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'BNB Testnet',
      symbol: 'tBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
      isNative: true,
    },
    wtoken: {
      address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      decimals: 18,
      logo: '/img/token/BNB.svg',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
        decimals: 18,
      },
      {
        name: 'BUSD',
        symbol: 'BUSD',
        address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
        decimals: 18,
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x1C47E37f13299d9989587edCb3875c5FcED57E99' },
      {
        key: 'tokenTaxFactory',
        label: 'Tax Token Creation',
        address: '0xDbE4ec6610980A0Ea951F7f813A8078013b634eA',
        dex: 'PancakeSwap',
        version: 'v2',
      },
    ],
  },
  {
    isEnable: true,
    key: 'eth',
    chainId: 1,
    network: mainnet,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'ETH',
    fullName: 'Ethereum',
    icon: '/img/chain/eth.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: ['https://eth-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        rates: [3000],
      },
      {
        type: 'Uniswap',
        version: 'v3',
        name: 'Uniswap V3',
        routerAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        quoterV2Address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
        rates: [100, 500, 3000, 10000],
      },
    ],
    explorerBaseUrl: 'https://etherscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/eth.svg',
      isNative: true,
    },
    wtoken: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449' },
      {
        key: 'tokenTaxFactory',
        label: 'Tax Token Creation',
        address: '0x31551329E6fe50a6db1A3858175dc652F194239C',
        dex: 'Uniswap',
        version: 'v2',
      },
    ],
  },
  {
    isEnable: true,
    key: 'base',
    chainId: 8453,
    network: base,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'BASE',
    fullName: 'Base',
    icon: '/img/chain/base.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: ['https://base-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm'],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        routerAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
        rates: [3000],
      },
      {
        type: 'Uniswap',
        version: 'v3',
        name: 'Uniswap V3',
        routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
        factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
        quoterV2Address: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
        rates: [100, 500, 3000, 10000],
      },
    ],
    explorerBaseUrl: 'https://basescan.org',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/base.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'Tether USD',
        symbol: 'USDT',
        address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        decimals: 6,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 6,
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x4D09F42905E7481d3A8E39AB8777170f6D598A3b' },
      {
        key: 'tokenTaxFactory',
        label: 'Tax Token Creation',
        address: '0xd9C578C35255988681dCAe665206EC443624FD6a',
        dex: 'Uniswap',
        version: 'v2',
      },
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
  return value === 'token-creation' || value === 'tax-token-creation' || value === 'project-acceptance'
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
