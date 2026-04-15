import {
  arbitrum,
  avalanche,
  base,
  blast,
  bsc,
  bscTestnet,
  coreDao,
  cronos,
  hyperEvm,
  linea,
  mainnet,
  mantle,
  metis,
  monad,
  optimism,
  plasma,
  polygon,
  pulsechain,
  scroll,
  sonic,
  unichain,
  xLayer,
} from 'wagmi/chains'
import { defineChain, type Chain } from 'viem'

export type SupportedLang = 'en-us' | 'zh-cn'
export type SupportedChainKey =
  | 'bsc'
  | 'bsc-testnet'
  | 'eth'
  | 'base'
  | 'x-layer'
  | 'plasma'
  | 'monad'
  | 'polygon'
  | 'avalanche'
  | 'arbitrum'
  | 'optimism'
  | 'sonic'
  | 'unichain'
  | 'hyperevm'
  | 'linea'
  | 'mantle'
  | 'blast'
  | 'scroll'
  | 'metis'
  | 'cronos'
  | 'pulse'
  | 'core'
  | 'gate-layer'
export type SupportedPageKey =
  | 'home'
  | 'token-creation'
  | 'tax-token-creation'
  | 'token-dividend-creation'
  | 'token-vanity-creation'

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
  nonfungiblePositionManager?: `0x${string}`
  swapRouterAddress?: `0x${string}`
  rates?: number[]
}

export type ExplorerPathTemplates = {
  hash?: string
  token?: string
  address?: string
}

export type ChainDefinition = {
  isEnable: boolean
  seoIndex: boolean
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
  explorer?: ExplorerPathTemplates
  nativeToken: TokenMeta
  wtoken: TokenMeta
  stableCoins?: TokenMeta[]
  contractList: ContractMeta[]
}

export const DEFAULT_LANG: SupportedLang = 'en-us'
export const DEFAULT_CHAIN: SupportedChainKey = 'bsc'
export const DEFAULT_PAGE: SupportedPageKey = 'home'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

function readRpcEnv(name: string | string[], fallback: string) {
  const keys = Array.isArray(name) ? name : [name]

  for (const key of keys) {
    const value = import.meta.env[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function getDefaultRpcFromChain(chain: Chain) {
  return chain.rpcUrls.default.http[0] ?? ''
}

function withRpcUrl<T extends Chain>(chain: T, rpcUrl: string): T {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: {
        ...chain.rpcUrls.default,
        http: [rpcUrl],
      },
      public: {
        ...(chain.rpcUrls.public ?? chain.rpcUrls.default),
        http: [rpcUrl],
      },
    },
  } as T
}

const GATE_LAYER_DEFAULT_RPC = 'https://gatelayer-mainnet.gatenode.cc'

const DEFAULT_RPC: Record<SupportedChainKey, string> = {
  bsc: readRpcEnv('VITE_APP_BSC_DEFAULT_RPC', getDefaultRpcFromChain(bsc)),
  'bsc-testnet': readRpcEnv('VITE_APP_BSC_TESTNET_DEFAULT_RPC', getDefaultRpcFromChain(bscTestnet)),
  eth: readRpcEnv('VITE_APP_ETH_DEFAULT_RPC', getDefaultRpcFromChain(mainnet)),
  base: readRpcEnv('VITE_APP_BASE_DEFAULT_RPC', getDefaultRpcFromChain(base)),
  'x-layer': readRpcEnv('VITE_APP_XLAYER_DEFAULT_RPC', getDefaultRpcFromChain(xLayer)),
  plasma: readRpcEnv('VITE_APP_PLASMA_DEFAULT_RPC', getDefaultRpcFromChain(plasma)),
  monad: readRpcEnv('VITE_APP_MONAD_DEFAULT_RPC', getDefaultRpcFromChain(monad)),
  polygon: readRpcEnv('VITE_APP_POLYGON_DEFAULT_RPC', getDefaultRpcFromChain(polygon)),
  avalanche: readRpcEnv('VITE_APP_AVALANCHE_DEFAULT_RPC', getDefaultRpcFromChain(avalanche)),
  arbitrum: readRpcEnv('VITE_APP_ARBITRUM_DEFAULT_RPC', getDefaultRpcFromChain(arbitrum)),
  optimism: readRpcEnv('VITE_APP_OPTIMISM_DEFAULT_RPC', getDefaultRpcFromChain(optimism)),
  sonic: readRpcEnv('VITE_APP_SONIC_DEFAULT_RPC', getDefaultRpcFromChain(sonic)),
  unichain: readRpcEnv('VITE_APP_UNICHAIN_DEFAULT_RPC', getDefaultRpcFromChain(unichain)),
  hyperevm: readRpcEnv(['VITE_APP_HYPERCHAIN_DEFAULT_RPC'], getDefaultRpcFromChain(hyperEvm)),
  linea: readRpcEnv('VITE_APP_LINEA_DEFAULT_RPC', getDefaultRpcFromChain(linea)),
  mantle: readRpcEnv('VITE_APP_MANTLE_DEFAULT_RPC', getDefaultRpcFromChain(mantle)),
  blast: readRpcEnv('VITE_APP_BLAST_DEFAULT_RPC', getDefaultRpcFromChain(blast)),
  scroll: readRpcEnv('VITE_APP_SCROLL_DEFAULT_RPC', getDefaultRpcFromChain(scroll)),
  metis: readRpcEnv('VITE_APP_METIS_DEFAULT_RPC', getDefaultRpcFromChain(metis)),
  cronos: readRpcEnv('VITE_APP_CRONOS_DEFAULT_RPC', getDefaultRpcFromChain(cronos)),
  pulse: readRpcEnv('VITE_APP_PULSECHAIN_DEFAULT_RPC', getDefaultRpcFromChain(pulsechain)),
  core: readRpcEnv('VITE_APP_COREDAO_DEFAULT_RPC', getDefaultRpcFromChain(coreDao)),
  'gate-layer': readRpcEnv('VITE_APP_GATE_LAYER_DEFAULT_RPC', GATE_LAYER_DEFAULT_RPC),
}

const gateLayer = defineChain({
  id: 10088,
  name: 'Gate Layer',
  nativeCurrency: {
    name: 'GateToken',
    symbol: 'GT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [DEFAULT_RPC['gate-layer']],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gate Layer Explorer',
      url: 'https://www.gatescan.org/gatelayer',
    },
  },
})

export const supportedLanguages: Array<{ key: SupportedLang; label: string }> = [
  { key: 'en-us', label: 'English' },
  { key: 'zh-cn', label: '简体中文' },
]

const supportedChainsBase: ChainDefinition[] = [
  {
    isEnable: true,
    seoIndex: true,
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
    rpcList: [DEFAULT_RPC.bsc],
    dexs: [
      {
        type: 'PancakeSwap',
        version: 'v2',
        name: 'PancakeSwap V2',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        rates: [2500],
      },
      {
        type: 'PancakeSwap',
        version: 'v3',
        name: 'PancakeSwap V3',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
        factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        quoterV2Address: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
        nonfungiblePositionManager: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
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
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'World Liberty Financial USD',
        symbol: 'USD1',
        address: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d',
        decimals: 18,
        logo: '/img/token/USD1.png',
      },
      {
        name: 'Binance-Peg USD Coin',
        symbol: 'USDC',
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        decimals: 18,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x78B84D2A29eA3e199aB81C48B687630AEA124A33' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x257eA5652423dd5551Fad18438b35Ef422Ddc01c' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x95547365Ef339A7dF41feEB38A4029A9476107Ed', dex: 'PancakeSwap', version: 'v2',},
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
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
    rpcList: [DEFAULT_RPC['bsc-testnet']],
    dexs: [
      {
        type: 'PancakeSwap',
        version: 'v2',
        name: 'PancakeSwap V2',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
        factoryAddress: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
        rates: [2500],
      },
      {
        type: 'PancakeSwap',
        version: 'v3',
        name: 'PancakeSwap V3',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
        factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        quoterV2Address: '0xB048BBC1Ee6B733FFfcfb9e9CEF7375518e25997',
        nonfungiblePositionManager: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
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
        logo: '/img/token/USDT.svg',
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
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x2D230df14678DD87EBc586EeDD6d0D14268Eb6c3' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0xDbE4ec6610980A0Ea951F7f813A8078013b634eA', dex: 'PancakeSwap', version: 'v2',},
      { key: 'dividendTokenFactory', label: 'Dividend Token Creation', address: '0xc1DA11E64A26ED4A8F0060D9D6cD3C00B0A7890f', dex: 'PancakeSwap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: true,
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
    rpcList: [DEFAULT_RPC.eth],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        rates: [3000],
      },
      {
        type: 'Uniswap',
        version: 'v3',
        name: 'Uniswap V3',
        logo: '/img/dex/uniswap.png',
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
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x26148F758BCb16640305FC73a289b03456B3248c' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x31551329E6fe50a6db1A3858175dc652F194239C', dex: 'Uniswap', version: 'v2',},
    ],
  },
  {
    isEnable: true,
    seoIndex: true,
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
    rpcList: [DEFAULT_RPC.base],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
        rates: [3000],
      },
      {
        type: 'Uniswap',
        version: 'v3',
        name: 'Uniswap V3',
        logo: '/img/dex/uniswap.png',
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
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
      {
        name: "Dai",
        symbol: "DAI",
        address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
        decimals: 6,
        logo: "/img/token/DAI_1.png",
      },
      {
        name: "USDS",
        symbol: "USDS",
        address: "0x820C137fa70C8691f0e44Dc420a5e53c168921Dc",
        decimals: 18,
        logo: "/img/token/USDS.svg",
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x4D09F42905E7481d3A8E39AB8777170f6D598A3b' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x95547365Ef339A7dF41feEB38A4029A9476107Ed' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0xd9C578C35255988681dCAe665206EC443624FD6a',dex: 'Uniswap', version: 'v2',},
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'x-layer',
    chainId: 196,
    network: xLayer,
    defaultDex: 'SlerfSwap',
    EIP1559: false,
    name: 'XLayer',
    fullName: 'X Layer',
    icon: '/img/chain/xlayer.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC['x-layer']],
    dexs: [
      {
        type: 'SlerfSwap',
        version: 'v2',
        name: 'SlerfSwap V2',
        logo: '/img/dex/slerfswap.png',
        routerAddress: '0x04aE0E6364635f307A7c81Bee1F8612C14d19917',
        factoryAddress: '0x702758afEDBD000A982D5A9845b0B0b32916d97b',
        rates: [2000],
      },
      {
        type: 'SlerfSwap',
        version: 'v3',
        name: 'SlerfSwap V3',
        logo: '/img/dex/slerfswap.png',
        routerAddress: '0x88CBD52c55FEDA2E64faD06E99aA53b24272a9CB',
        factoryAddress: '0x2299c38c6e8855e18Db808386a1cd1bC9abDc625',
        quoterV2Address: '0xb77ccb98b88D39f570Ef6121Ab5B1a2850fce3c6',
        rates: [2000],
      },
      {
        type: 'Dyorswap',
        version: 'v2',
        name: 'Dyorswap V2',
        logo: '/img/dex/dyorswap.svg',
        routerAddress: '0x1E690F24F704672e44255013C2cB22FC04c46036',
        factoryAddress: '0x2CcaDb1e437AA9cDc741574bDa154686B1F04C09',
        rates: [3000],
      },
      {
        type: 'PotatoSwap',
        version: 'v2',
        name: 'PotatoSwap V2',
        logo: '/img/dex/potatoswap.svg',
        routerAddress: '0x881fB2f98c13d521009464e7D1CBf16E1b394e8E',
        factoryAddress: '0x630DB8E822805c82Ca40a54daE02dd5aC31f7fcF',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://www.oklink.com/xlayer',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
      logo: '/img/chain/xlayer.svg',
      isNative: true,
    },
    wtoken: {
      address: '0xe538905cf8410324e03a5a23c1c177a474d59b2b',
      name: 'Wrapped OKB',
      symbol: 'OKB',
      decimals: 18,
      logo: '/img/chain/xlayer.svg',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x74b7f16337b8972027f6196a17a631ac6de26d22',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
      {
        name: 'USD₮0',
        symbol: 'USD₮0',
        address: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x26148F758BCb16640305FC73a289b03456B3248c' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449', dex: 'SlerfSwap', version: 'v2' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0xF5fc7a89beE9260c5CB7103B1a9585ab1a427c4C', dex: 'Dyorswap', version: 'v2' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0xcC22A79a34370f969AEBAC9f6079253aaeC1d0EC', dex: 'PotatoSwap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'plasma',
    chainId: 9745,
    network: plasma,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'Plasma',
    fullName: 'Plasma',
    icon: '/img/chain/plasma.svg',
    tokenType: 'PRC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.plasma],
    dexs: [
      {
        type: 'Lithos',
        version: 'v2',
        name: 'Lithos RouterV2',
        logo: '/img/dex/lithos.svg',
        routerAddress: '0xD70962bd7C6B3567a8c893b55a8aBC1E151759f3',
        factoryAddress: '0x71a870D1c935C2146b87644DF3B5316e8756aE18',
      },
      // {
      //   type: 'Uniswap',
      //   version: 'v3',
      //   name: 'Oku Trade (Uniswap V3)',
      //   logo: '/img/dex/uniswap.png',
      //   routerAddress: '0x807F4E281B7A3B324825C64ca53c69F0b418dE40',
      //   factoryAddress: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
      //   quoterV2Address: '0xaa52bB8110fE38D0d2d2AF0B85C3A3eE622CA455',
      //   nonfungiblePositionManager: '0x743E03cceB4af2efA3CC76838f6E8B50B63F184c',
      //   rates: [100, 500, 3000, 10000],
      // },
    ],
    explorerBaseUrl: 'https://plasmascan.to',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Plasma',
      symbol: 'XPL',
      decimals: 18,
      logo: '/img/chain/plasma.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x6100E367285b01F48D07953803A2d8dCA5D19873',
      name: 'Wrapped Plasma',
      symbol: 'XPL',
      decimals: 18,
      logo: '/img/chain/plasma.svg',
    },
    stableCoins: [
      {
        name: 'USDT0',
        symbol: 'USDT0',
        address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0xd2FF781eF8Db655c242bBF92e6707562f3d15Ac9' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'monad',
    chainId: 143,
    network: monad,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'MONAD',
    fullName: 'Monad',
    icon: '/img/chain/monad.png',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.monad],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x4b2ab38dbf28d31d467aa8993f6c2585981d6804',
        factoryAddress: '0x182a927119d56008d921126764bf884221b10f59',
        swapRouterAddress: '0x392EedB445Fc8fD1763Bf057A7d8440A25500eF0',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://monadvision.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Monad',
      symbol: 'MON',
      decimals: 18,
      logo: '/img/chain/monad.png',
      isNative: true,
    },
    wtoken: {
      address: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
      name: 'Wrapped Monad',
      symbol: 'MON',
      decimals: 18,
      logo: '/img/chain/monad.png',
    },
    stableCoins: [
      {
        name: 'USDT0',
        symbol: 'USDT0',
        address: '0xe7cd86e13AC4309349F30B3435a9d337750fC82D',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x150F51B8F041b50065fad75EA6333E086EF0AA31' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x26148F758BCb16640305FC73a289b03456B3248c', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'polygon',
    chainId: 137,
    network: polygon,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'POLYGON',
    fullName: 'Polygon',
    icon: '/img/chain/polygon.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.polygon],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0xedf6066a2b290C185783862C7F4776A2C8077AD1',
        factoryAddress: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
        swapRouterAddress: '0x26148F758BCb16640305FC73a289b03456B3248c',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://polygonscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Polygon',
      symbol: 'POL',
      decimals: 18,
      logo: '/img/chain/polygon.webp',
      isNative: true,
    },
    wtoken: {
      address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      name: 'Wrapped POL',
      symbol: 'WPOL',
      decimals: 18,
      logo: '/img/chain/polygon.webp',
    },
    stableCoins: [
      {
        name: 'USDT0',
        symbol: 'USDT0',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
      {
        name: 'DAI',
        symbol: 'DAI',
        address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        decimals: 18,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'avalanche',
    chainId: 43114,
    network: avalanche,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'AVAX',
    fullName: 'Avalanche',
    icon: '/img/chain/avalanche.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.avalanche],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factoryAddress: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
        swapRouterAddress: '0xcC22A79a34370f969AEBAC9f6079253aaeC1d0EC',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://snowtrace.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
      logo: '/img/chain/avalanche.svg',
      isNative: true,
    },
    wtoken: {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
      decimals: 18,
      logo: '/img/chain/avalanche.svg',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0xB1930738C1e4ac3C0bf4877aFce9e5C7493141ed' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'arbitrum',
    chainId: 42161,
    network: arbitrum,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'ARB',
    fullName: 'Arbitrum One',
    icon: '/img/chain/arbitrum.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.arbitrum],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        factoryAddress: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
        swapRouterAddress: '0xF5fc7a89beE9260c5CB7103B1a9585ab1a427c4C',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://arbiscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Arbitrum',
      symbol: 'ARB',
      decimals: 18,
      logo: '/img/chain/arbitrum.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'USD₮0',
        symbol: 'USD₮0',
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'optimism',
    chainId: 10,
    network: optimism,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'OP',
    fullName: 'Optimism',
    icon: '/img/chain/optimism.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.optimism],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2',
        factoryAddress: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
        swapRouterAddress: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://optimistic.etherscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/optimism.svg',
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
        name: 'USDT',
        symbol: 'USDT',
        address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x150F51B8F041b50065fad75EA6333E086EF0AA31' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'sonic',
    chainId: 146,
    network: sonic,
    EIP1559: true,
    name: 'SONIC',
    fullName: 'Sonic',
    icon: '/img/chain/sonic.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.sonic],
    dexs: [
      {
        type: 'Shadow',
        version: 'v2',
        name: 'Shadow V2',
        logo: '/img/dex/shadow.svg',
        routerAddress: '0x1D368773735ee1E678950B7A97bcA2CafB330CDc',
        factoryAddress: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8',
        // swapRouterAddress: '',
        rates: [3000]
      },
      {
        type: 'Shadow',
        version: 'v3',
        name: 'Shadow V3',
        logo: '/img/dex/shadow.svg',
        routerAddress: '0x5543c6176FEb9B4b179078205d7C29EEa2e2d695',
        factoryAddress: '0xcD2d0637c94fe77C2896BbCBB174cefFb08DE6d7',
        quoterV2Address: '0x219b7ADebc0935a3eC889a148c6924D51A07535A',
        nonfungiblePositionManager: "0x12E66C8F215DdD5d48d150c8f46aD0c6fB0F4406",
        rates: [100, 500, 2500, 10000],
      }
    ],
    explorerBaseUrl: 'https://sonicscan.org',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
      logo: '/img/chain/sonic.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
      name: 'Wrapped Sonic',
      symbol: 'wS',
      decimals: 18,
      logo: '/img/chain/sonic.svg',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x6047828dc181963ba44974801FF68e538dA5eaF9',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x9a232934326e2a1598acc7fff4b37d82ac39a462', dex: 'Shadow', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'unichain',
    chainId: 130,
    network: unichain,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'UNI',
    fullName: 'Unichain',
    icon: '/img/chain/unichain.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.unichain],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0x284f11109359a7e1306c3e447ef14d38400063ff',
        factoryAddress: '0x1f98400000000000000000000000000000000002',
        swapRouterAddress: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://uniscan.xyz',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/unichain.webp',
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
        name: 'USD₮0',
        symbol: 'USD₮0',
        address: '0x9151434b16b9763660705744891fA906F660EcC5',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x150F51B8F041b50065fad75EA6333E086EF0AA31' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'hyperevm',
    chainId: 999,
    network: hyperEvm,
    EIP1559: true,
    name: 'HYPE',
    fullName: 'HyperEVM',
    icon: '/img/chain/hyperevm.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.hyperevm],
    dexs: [],
    explorerBaseUrl: 'https://hyperevmscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'HyperEVM',
      symbol: 'HYPE',
      decimals: 18,
      logo: '/img/chain/hyperevm.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x5555555555555555555555555555555555555555',
      name: 'Wrapped HYPE',
      symbol: 'WHYPE',
      decimals: 18,
      logo: '/img/chain/hyperevm.svg',
    },
    stableCoins: [
      {
        name: 'USD₮0',
        symbol: 'USD₮0',
        address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'linea',
    chainId: 59144,
    network: linea,
    EIP1559: true,
    name: 'LINEA',
    fullName: 'Linea',
    icon: '/img/chain/linea.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.linea],
    dexs: [
      {
        type: 'PancakeSwap',
        version: 'v2',
        name: 'PancakeSwap V2',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb',
        factoryAddress: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
        rates: [2500],
      },
      {
        type: 'PancakeSwap',
        version: 'v3',
        name: 'PancakeSwap V3',
        logo: '/img/dex/pancake.svg',
        routerAddress: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
        factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        quoterV2Address: '0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2',
        nonfungiblePositionManager: "0x427bF5b37357632377eCbEC9de3626C71A5396c1",
        rates: [100, 500, 2500, 10000],
      }
    ],
    explorerBaseUrl: 'https://lineascan.build',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/linea.webp',
      isNative: true,
    },
    wtoken: {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x31551329E6fe50a6db1A3858175dc652F194239C', dex: 'PancakeSwap', version: 'v2', },
    ],
  },
  {
    isEnable: false,
    seoIndex: false,
    key: 'mantle',
    chainId: 5000,
    network: mantle,
    EIP1559: true,
    name: 'MANTLE',
    fullName: 'Mantle',
    icon: '/img/chain/mantle.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.mantle],
    dexs: [],
    explorerBaseUrl: 'https://mantlescan.xyz',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18,
      logo: '/img/chain/mantle.webp',
      isNative: true,
    },
    wtoken: {
      address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDT0',
        symbol: 'USDT0',
        address: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'blast',
    chainId: 81457,
    network: blast,
    defaultDex: 'Uniswap',
    EIP1559: true,
    name: 'BLAST',
    fullName: 'Blast',
    icon: '/img/chain/blast.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.blast],
    dexs: [
      {
        type: 'Uniswap',
        version: 'v2',
        name: 'Uniswap V2',
        logo: '/img/dex/uniswap.png',
        routerAddress: '0xBB66Eb1c5e875933D44DAe661dbD80e5D9B03035',
        factoryAddress: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
        swapRouterAddress: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf',
        rates: [3000],
      },
    ],
    explorerBaseUrl: 'https://blastscan.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/blast.webp',
      isNative: true,
    },
    wtoken: {
      address: '0x4300000000000000000000000000000000000004',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'USDB',
        symbol: 'USDB',
        address: '0x4300000000000000000000000000000000000003',
        decimals: 18,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x150F51B8F041b50065fad75EA6333E086EF0AA31' },
      { key: 'tokenTaxFactory', label: 'Tax Token Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A', dex: 'Uniswap', version: 'v2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'scroll',
    chainId: 534352,
    network: scroll,
    EIP1559: true,
    name: 'SCROLL',
    fullName: 'Scroll',
    icon: '/img/chain/scroll.webp',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.scroll],
    dexs: [],
    explorerBaseUrl: 'https://scrollscan.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logo: '/img/chain/scroll.webp',
      isNative: true,
    },
    wtoken: {
      address: '0x5300000000000000000000000000000000000004',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0xb87E8C20f1DdDCB7157FA8BC2282100DEb535A29' },
    ],
  },
  {
    isEnable: false,
    seoIndex: false,
    key: 'metis',
    chainId: 1088,
    network: metis,
    EIP1559: false,
    name: 'METIS',
    fullName: 'Metis',
    icon: '/img/chain/metis.svg',
    tokenType: 'ERC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.metis],
    dexs: [],
    explorerBaseUrl: 'https://explorer.metis.io',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
      logo: '/img/chain/metis.svg',
      isNative: true,
    },
    wtoken: {
      address: '0x420000000000000000000000000000000000000A',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logo: '/img/token/WETH.png',
    },
    stableCoins: [
      {
        name: 'm.USDT',
        symbol: 'm.USDT',
        address: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'm.USDC',
        symbol: 'm.USDC',
        address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x5eF35d1ccB6724847026D4f7Bb08d0181047bAFf' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x58c7627bBa4B2217985078822851B7ac2cDC6a0A' },
    ],
  },
  {
    isEnable: false,
    seoIndex: false,
    key: 'cronos',
    chainId: 25,
    network: cronos,
    EIP1559: true,
    name: 'CRO',
    fullName: 'Cronos Mainnet',
    icon: '/img/chain/cronos.webp',
    tokenType: 'CRC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.cronos],
    dexs: [],
    explorerBaseUrl: 'https://explorer.cronos.org',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Cronos',
      symbol: 'CRO',
      decimals: 18,
      logo: '/img/chain/cronos.webp',
      isNative: true,
    },
    wtoken: {
      address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
      name: 'Wrapped CRO',
      symbol: 'WCRO',
      decimals: 18,
      logo: '/img/chain/cronos.webp',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x66e428c3f67a68878562e79A0234c1F83c208770',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [],
  },
  {
    isEnable: false,
    seoIndex: false,
    key: 'pulse',
    chainId: 369,
    network: pulsechain,
    EIP1559: true,
    name: 'PULSE',
    fullName: 'PulseChain',
    icon: '/img/chain/pulse.webp',
    tokenType: 'CRC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.pulse],
    dexs: [],
    explorerBaseUrl: 'https://ipfs.scan.pulsechain.com',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'PulseChain',
      symbol: 'PLS',
      decimals: 18,
      logo: '/img/chain/pulse.webp',
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
        name: 'USDT',
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'core',
    chainId: 1116,
    network: coreDao,
    EIP1559: true,
    name: 'CORE',
    fullName: 'Core Dao',
    icon: '/img/chain/core.png',
    tokenType: 'CRC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC.core],
    dexs: [],
    explorerBaseUrl: 'https://scan.coredao.org',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'Core',
      symbol: 'CORE',
      decimals: 18,
      logo: '/img/chain/core.png',
      isNative: true,
    },
    wtoken: {
      address: '0x40375c92d9faf44d2f9db9bd9ba41a3317a2404f',
      name: 'Wrapped CORE',
      symbol: 'WCORE',
      decimals: 18,
      logo: '/img/chain/core.png',
    },
    stableCoins: [
      {
        name: 'USDT',
        symbol: 'USDT',
        address: '0x900101d06a7426441ae63e9ab3b9b0f63be145f1',
        decimals: 6,
        logo: '/img/token/USDT.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0xa4151b2b3e269645181dccf2d426ce75fcbdeca9',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x63Ae170E698Df60e42060e54fBFf7a463218cbDD' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x52360F08Bd2cCa0BAedA1Ac2c3f0C17720C500f2' },
    ],
  },
  {
    isEnable: true,
    seoIndex: false,
    key: 'gate-layer',
    chainId: 10088,
    network: gateLayer,
    EIP1559: false,
    name: 'GATE',
    fullName: 'Gate Layer',
    icon: '/img/chain/gt.webp',
    tokenType: 'GRC20',
    deployUrl: '',
    rpcList: [DEFAULT_RPC['gate-layer']],
    dexs: [],
    explorerBaseUrl: 'https://www.gatescan.org/gatelayer',
    nativeToken: {
      address: ZERO_ADDRESS,
      name: 'GateToken',
      symbol: 'GT',
      decimals: 18,
      logo: '/img/chain/gt.webp',
      isNative: true,
    },
    wtoken: {
      address: '0x6803b8E93b13941F6B73b82E324B80251B3dE338',
      name: 'Wrapped GT',
      symbol: 'WGT',
      decimals: 18,
      logo: '/img/chain/gt.webp',
    },
    stableCoins: [
      {
        name: 'GUSD',
        symbol: 'GUSD',
        address: '0xECE3F96198a5E6B9b2278edbEa8d548F66050d1c',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
      {
        name: 'USDC',
        symbol: 'USDC',
        address: '0x8a2B28364102Bea189D99A475C494330Ef2bDD0B',
        decimals: 6,
        logo: '/img/token/USDC.svg',
      },
    ],
    contractList: [
      { key: 'tokenFactory', label: 'Token Creation', address: '0x7AFC146F26f9a794b47b1b8C3eDce0561fA40679' },
      { key: 'tokenVanityFactory', label: 'Token Vanity Creation', address: '0x4F9C17c25506AEB5b6bA06fF7ABaA06285ae1859' },
    ],
  },
]

const NETWORK_BY_CHAIN_KEY: Record<SupportedChainKey, Chain> = {
  bsc: withRpcUrl(bsc, DEFAULT_RPC.bsc),
  'bsc-testnet': withRpcUrl(bscTestnet, DEFAULT_RPC['bsc-testnet']),
  eth: withRpcUrl(mainnet, DEFAULT_RPC.eth),
  base: withRpcUrl(base, DEFAULT_RPC.base),
  'x-layer': withRpcUrl(xLayer, DEFAULT_RPC['x-layer']),
  plasma: withRpcUrl(plasma, DEFAULT_RPC.plasma),
  monad: withRpcUrl(monad, DEFAULT_RPC.monad),
  polygon: withRpcUrl(polygon, DEFAULT_RPC.polygon),
  avalanche: withRpcUrl(avalanche, DEFAULT_RPC.avalanche),
  arbitrum: withRpcUrl(arbitrum, DEFAULT_RPC.arbitrum),
  optimism: withRpcUrl(optimism, DEFAULT_RPC.optimism),
  sonic: withRpcUrl(sonic, DEFAULT_RPC.sonic),
  unichain: withRpcUrl(unichain, DEFAULT_RPC.unichain),
  hyperevm: withRpcUrl(hyperEvm, DEFAULT_RPC.hyperevm),
  linea: withRpcUrl(linea, DEFAULT_RPC.linea),
  mantle: withRpcUrl(mantle, DEFAULT_RPC.mantle),
  blast: withRpcUrl(blast, DEFAULT_RPC.blast),
  scroll: withRpcUrl(scroll, DEFAULT_RPC.scroll),
  metis: withRpcUrl(metis, DEFAULT_RPC.metis),
  cronos: withRpcUrl(cronos, DEFAULT_RPC.cronos),
  pulse: withRpcUrl(pulsechain, DEFAULT_RPC.pulse),
  core: withRpcUrl(coreDao, DEFAULT_RPC.core),
  'gate-layer': withRpcUrl(gateLayer, DEFAULT_RPC['gate-layer']),
}

export const supportedChains: ChainDefinition[] = supportedChainsBase
  .filter((chain) => chain.isEnable)
  .map((chain) => ({
    ...chain,
    network: NETWORK_BY_CHAIN_KEY[chain.key],
    rpcList: [DEFAULT_RPC[chain.key]],
    contractList: chain.contractList,
  }))

export function isSupportedLang(value?: string): value is SupportedLang {
  return supportedLanguages.some((language) => language.key === value)
}

export function isSupportedChain(value?: string): value is SupportedChainKey {
  return supportedChains.some((chain) => chain.key === value)
}

export function isSupportedPage(value?: string): value is SupportedPageKey {
  return (
    value === 'home' ||
    value === 'token-creation' ||
    value === 'tax-token-creation' ||
    value === 'token-dividend-creation' ||
    value === 'token-vanity-creation'
  )
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

export function getExplorerUrl(
  chain: ChainDefinition,
  type: keyof ExplorerPathTemplates,
  value?: string,
) {
  if (!value) {
    return ''
  }

  const defaultTemplates: Required<ExplorerPathTemplates> = {
    hash: '/tx/{value}',
    token: '/token/{value}',
    address: '/address/{value}',
  }

  const template = chain.explorer?.[type] ?? defaultTemplates[type]

  if (/^https?:\/\//.test(template)) {
    return template.replace('{value}', value)
  }

  const normalizedBaseUrl = chain.explorerBaseUrl.replace(/\/+$/, '')
  const normalizedPath = template.startsWith('/') ? template : `/${template}`
  return `${normalizedBaseUrl}${normalizedPath.replace('{value}', value)}`
}
