import type { ChainDefinition } from '@/config/chains'

export type TokenManageType = 'dividend'

export type TokenManageRole = 'owner' | 'fund' | 'viewer'

export type TokenDisplayInfo = {
  address: string
  symbol: string
  decimals: number
  name?: string
  isNative?: boolean
}

export type DividendTokenManageInfo = {
  type: 'dividend'
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  totalSupplyDisplay: string
  owner: string
  receiveAddress: string
  fundAddress: string
  swapRouter: string
  mainPair: string
  basePoolToken: string
  basePoolTokenInfo?: TokenDisplayInfo
  isSameTokenDividend: boolean
  dividendToken: string
  dividendTokenInfo?: TokenDisplayInfo
  dividendTracker: string
  buyFundFee: bigint
  buyLPFee: bigint
  buyBurnFee: bigint
  buyDividendFee: bigint
  sellFundFee: bigint
  sellLPFee: bigint
  sellBurnFee: bigint
  sellDividendFee: bigint
  transferFundFee: bigint
  transferLPFee: bigint
  transferBurnFee: bigint
  transferDividendFee: bigint
  minHoldingForDividend: bigint
  minHoldingForDividendDisplay: string
  autoProcessGasLimit: bigint
  dividendTriggerThreshold: bigint
  dividendTriggerThresholdDisplay: string
  pendingDividends: bigint
  pendingDividendsDisplay: string
  totalDividendsDistributed: bigint
  totalDividendsDistributedDisplay: string
  killBlockCount: bigint
  tradingEnabled: boolean
  manualTradingEnable: boolean
  mintEnabled: boolean
  blacklistEnabled: boolean
  whitelistEnabled: boolean
  initialSupply: bigint
  initialSupplyDisplay: string
  totalMinted: bigint
  totalMintedDisplay: string
  remainingMintable: bigint
  remainingMintableDisplay: string
  whitelistAddresses: string[]
  blacklistAddresses: string[]
  protectedAddresses: string[]
}

export type TokenManageState =
  | {
      tokenType: 'dividend'
      tokenInfo: DividendTokenManageInfo
      isLoading: boolean
      isError: false
      errorKey?: never
    }
  | {
      tokenType: null
      tokenInfo?: undefined
      isLoading: boolean
      isError: boolean
      errorKey?: string
    }

export type TokenManageViewModel = {
  chainDefinition: ChainDefinition
  tokenAddressInput: string
  setTokenAddressInput: (value: string) => void
  onLoadToken: () => void
  onClearToken: () => void
  tokenAddress: string
  tokenState: TokenManageState
  role: TokenManageRole
  connectedAddress: string
  isConnected: boolean
  refetch: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export type OverviewCardModel = {
  key: string
  label: string
  value: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
  description?: string
}

export function formatBigIntUnits(value: bigint, decimals: number, maxFractionDigits = 4) {
  const raw = Number(value) / 10 ** decimals
  if (!Number.isFinite(raw)) {
    return '0'
  }

  return trimTrailingZeros(
    raw.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFractionDigits,
      useGrouping: false,
    }),
  )
}

export function formatDisplayNumber(value: string | number | bigint | undefined) {
  if (value == null || value === '') {
    return '--'
  }

  const nextValue = typeof value === 'bigint' ? Number(value) : Number(value)
  if (!Number.isFinite(nextValue)) {
    return String(value)
  }

  return nextValue.toLocaleString('en-US')
}

export function formatBasisPoints(value: bigint) {
  return trimTrailingZeros((Number(value) / 100).toFixed(2))
}

export function formatAddressText(value: string) {
  if (!value) {
    return '--'
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function normalizeTokenAddress(value?: string | null) {
  return value?.trim().toLowerCase() ?? ''
}

export function resolveTokenManageRole({
  owner,
  fundAddress,
  connectedAddress,
}: {
  owner: string
  fundAddress: string
  connectedAddress: string
}): TokenManageRole {
  const normalizedConnected = normalizeTokenAddress(connectedAddress)
  if (!normalizedConnected) {
    return 'viewer'
  }

  if (normalizeTokenAddress(owner) === normalizedConnected) {
    return 'owner'
  }

  if (normalizeTokenAddress(fundAddress) === normalizedConnected) {
    return 'fund'
  }

  return 'viewer'
}

function trimTrailingZeros(value: string) {
  return value.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').replace(/\.$/, '')
}
