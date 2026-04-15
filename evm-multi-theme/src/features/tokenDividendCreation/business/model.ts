import { getAddress, isAddress } from 'ethers'
import { parseUnits } from 'viem'
import type { TokenDisplayItem } from '@/components/common/token-display'
import type { ChainDefinition } from '@/config/chains'
import {
  calcDividendTaxCategoryTotal,
  calcDividendTaxGrandTotal,
  DIVIDEND_TAX_PREFIXES,
  DIVIDEND_TAX_SUFFIXES,
  MAX_DIVIDEND_TAX_PER_GROUP,
  MAX_DIVIDEND_TAX_TOTAL,
  type DividendTaxFieldKey,
} from './tax'

export type DividendExchangeOption = {
  value: string
  label: string
  dex: string
  version?: string
  logo?: string
  routerAddress: string
}

export type TokenDividendFormValues = Record<DividendTaxFieldKey, string> & {
  name: string
  symbol: string
  totalSupply: string
  decimals: number | null
  receiveAddress: string
  fundAddress: string
  exchange: string
  poolToken: string
  isSameTokenDividend: boolean
  dividendToken: string
  minHoldingForDividend: string
  dividendTriggerThreshold: string
  autoProcessGasLimit: string
  killBlockCount: string
  mintEnabled: boolean
  manualTradingEnable: boolean
  blacklistEnabled: boolean
  whitelistEnabled: boolean
  initialBlacklist: string
  initialWhitelist: string
}

export type TokenDividendFormErrors = Partial<Record<keyof TokenDividendFormValues | 'taxConfiguration', string>>

export type TokenDividendSubmitValues = TokenDividendFormValues & {
  decimals: number
  swapRouter: string
}

export type TokenDividendStepStatus = 'loading' | 'success' | 'failed'

export type TokenDividendSubmitStep = {
  id: number
  status: TokenDividendStepStatus
}

export type TokenDividendSubmitResult = {
  txHash: string
  tokenAddress?: string
  receiveAddress: string
  fundAddress: string
}

export type TokenDividendViewModel = {
  chainDefinition: ChainDefinition
  formValues: TokenDividendFormValues
  errors: TokenDividendFormErrors
  exchanges: DividendExchangeOption[]
  poolTokens: TokenDisplayItem[]
  rewardTokens: TokenDisplayItem[]
  creationFee: bigint | null
  feeLoading: boolean
  loading: boolean
  submitStep: TokenDividendSubmitStep | null
  result: TokenDividendSubmitResult | null
  successModalOpen: boolean
  failureModalOpen: boolean
  updateField: <Key extends keyof TokenDividendFormValues>(key: Key, value: TokenDividendFormValues[Key]) => void
  onPoolTokenResolved: (token: TokenDisplayItem) => void
  onRewardTokenResolved: (token: TokenDisplayItem) => void
  onSubmit: () => Promise<void>
  onCancelFlow: () => void
  onCloseSuccessModal: () => void
  onCloseFailureModal: () => void
  onClearResult: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const DEFAULT_AUTO_PROCESS_GAS_LIMIT = 50_000_000
const AUTO_PROCESS_GAS_LIMIT_BY_CHAIN: Partial<Record<number, number>> = {
  56: 50_000_000,
  97: 50_000_000,
}

const defaultTaxFields = DIVIDEND_TAX_PREFIXES.reduce(
  (accumulator, prefix) => {
    for (const suffix of DIVIDEND_TAX_SUFFIXES) {
      accumulator[`${prefix}${suffix}`] = '0'
    }
    return accumulator
  },
  {} as Record<DividendTaxFieldKey, string>,
)

export function getDividendExchangeOptions(chainDefinition: ChainDefinition): DividendExchangeOption[] {
  return chainDefinition.contractList
    .filter((contract) => contract.key === 'dividendTokenFactory' && contract.address)
    .flatMap((contract) => {
      const dex = chainDefinition.dexs?.find(
        (item) => item.type === contract.dex && (item.version ?? 'v2') === (contract.version ?? 'v2'),
      )

      if (!dex?.routerAddress) {
        return []
      }

      return [{
        value: normalizeAddress(contract.address),
        label: dex.name ?? `${contract.dex ?? 'Factory'} ${(contract.version ?? '').toUpperCase()}`.trim(),
        dex: contract.dex ?? dex.type,
        version: contract.version ?? dex.version,
        logo: dex.logo,
        routerAddress: normalizeAddress(dex.routerAddress),
      }]
    })
}

export function buildDividendPoolTokenOptions(chainDefinition: ChainDefinition): TokenDisplayItem[] {
  const nativeToken: TokenDisplayItem = {
    address: normalizeAddress(chainDefinition.nativeToken.address),
    name: chainDefinition.nativeToken.name ?? chainDefinition.nativeToken.symbol,
    symbol: chainDefinition.nativeToken.symbol,
    decimals: chainDefinition.nativeToken.decimals,
    logo: chainDefinition.nativeToken.logo,
    isNative: true,
  }

  const wrappedToken: TokenDisplayItem = {
    address: normalizeAddress(chainDefinition.wtoken.address),
    name: chainDefinition.wtoken.name ?? chainDefinition.wtoken.symbol,
    symbol: chainDefinition.wtoken.symbol,
    decimals: chainDefinition.wtoken.decimals,
    logo: chainDefinition.wtoken.logo,
  }

  const stableTokens =
    chainDefinition.stableCoins?.map((token) => ({
      address: normalizeAddress(token.address),
      name: token.name ?? token.symbol,
      symbol: token.symbol,
      decimals: token.decimals,
      logo: token.logo,
    })) ?? []

  return mergeTokenOptions([nativeToken], [wrappedToken], stableTokens)
}

export function buildDividendRewardTokenOptions(chainDefinition: ChainDefinition) {
  return buildDividendPoolTokenOptions(chainDefinition)
}

export function getDefaultTokenDividendValues(chainDefinition: ChainDefinition): TokenDividendFormValues {
  const exchanges = getDividendExchangeOptions(chainDefinition)
  const poolTokens = buildDividendPoolTokenOptions(chainDefinition)

  return {
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: 18,
    receiveAddress: '',
    fundAddress: '',
    exchange: exchanges[0]?.value ?? '',
    poolToken: poolTokens[0]?.address ?? normalizeAddress(chainDefinition.nativeToken.address),
    isSameTokenDividend: true,
    dividendToken: '',
    minHoldingForDividend: '',
    dividendTriggerThreshold: '',
    autoProcessGasLimit: String(getDefaultAutoProcessGasLimit(chainDefinition)),
    killBlockCount: '',
    mintEnabled: false,
    manualTradingEnable: false,
    blacklistEnabled: false,
    whitelistEnabled: false,
    initialBlacklist: '',
    initialWhitelist: '',
    ...defaultTaxFields,
  }
}

export function validateTokenDividend(
  values: TokenDividendFormValues,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const errors: TokenDividendFormErrors = {}

  if (!values.name.trim()) {
    errors.name = t('tokenDividendCreation.errors.nameRequired')
  } else if (values.name.trim().length > 100) {
    errors.name = t('tokenDividendCreation.errors.nameTooLong')
  }

  if (!values.symbol.trim()) {
    errors.symbol = t('tokenDividendCreation.errors.symbolRequired')
  } else if (values.symbol.trim().length > 100) {
    errors.symbol = t('tokenDividendCreation.errors.symbolTooLong')
  }

  if (!values.totalSupply.trim()) {
    errors.totalSupply = t('tokenDividendCreation.errors.supplyRequired')
  } else if (!/^\d+$/.test(values.totalSupply.trim())) {
    errors.totalSupply = t('tokenDividendCreation.errors.supplyInvalid')
  } else {
    try {
      if (BigInt(values.totalSupply) <= 0n) {
        errors.totalSupply = t('tokenDividendCreation.errors.supplyInvalid')
      }
    } catch {
      errors.totalSupply = t('tokenDividendCreation.errors.supplyInvalid')
    }
  }

  if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenDividendCreation.errors.decimalsInvalid')
  }

  if (values.receiveAddress.trim() && !isAddress(values.receiveAddress.trim())) {
    errors.receiveAddress = t('tokenDividendCreation.errors.receiveAddressInvalid')
  }

  if (values.fundAddress.trim() && !isAddress(values.fundAddress.trim())) {
    errors.fundAddress = t('tokenDividendCreation.errors.fundAddressInvalid')
  }

  if (!values.exchange) {
    errors.exchange = t('tokenDividendCreation.errors.exchangeRequired')
  }

  if (!values.poolToken) {
    errors.poolToken = t('tokenDividendCreation.errors.poolTokenRequired')
  }

  if (!values.isSameTokenDividend && !values.dividendToken) {
    errors.dividendToken = t('tokenDividendCreation.errors.dividendTokenRequired')
  }

  if (!values.isSameTokenDividend && values.dividendToken && !isAddress(values.dividendToken)) {
    errors.dividendToken = t('tokenDividendCreation.errors.dividendTokenInvalid')
  }

  if (!isValidPositiveDecimal(values.minHoldingForDividend)) {
    errors.minHoldingForDividend = t('tokenDividendCreation.errors.minHoldingInvalid')
  }

  if (!isValidPositiveDecimal(values.dividendTriggerThreshold)) {
    errors.dividendTriggerThreshold = t('tokenDividendCreation.errors.dividendTriggerThresholdInvalid')
  }

  if (!/^\d+$/.test(values.autoProcessGasLimit.trim()) || BigInt(values.autoProcessGasLimit || '0') <= 0n) {
    errors.autoProcessGasLimit = t('tokenDividendCreation.errors.autoProcessGasLimitInvalid')
  }

  if (values.killBlockCount.trim()) {
    if (!/^\d+$/.test(values.killBlockCount.trim())) {
      errors.killBlockCount = t('tokenDividendCreation.errors.killBlockInvalid')
    }
  }

  for (const prefix of DIVIDEND_TAX_PREFIXES) {
    for (const suffix of DIVIDEND_TAX_SUFFIXES) {
      const key = `${prefix}${suffix}` as DividendTaxFieldKey
      if (!isValidTaxValue(values[key])) {
        errors[key] = t('tokenDividendCreation.errors.taxValueInvalid')
      }
    }
  }

  const exceededGroup = DIVIDEND_TAX_PREFIXES.find((prefix) => calcDividendTaxCategoryTotal(values, prefix) > MAX_DIVIDEND_TAX_PER_GROUP)
  if (exceededGroup) {
    errors.taxConfiguration = t('tokenDividendCreation.errors.taxCategoryExceeded', {
      type: t(`tokenDividendCreation.taxGroups.${exceededGroup}`),
      max: MAX_DIVIDEND_TAX_PER_GROUP,
    })
  } else if (calcDividendTaxGrandTotal(values) > MAX_DIVIDEND_TAX_TOTAL) {
    errors.taxConfiguration = t('tokenDividendCreation.errors.taxGrandTotalExceeded', {
      max: MAX_DIVIDEND_TAX_TOTAL,
    })
  }

  if (values.blacklistEnabled && !isValidAddressListInput(values.initialBlacklist)) {
    errors.initialBlacklist = t('tokenDividendCreation.errors.addressListInvalid')
  }

  if (values.whitelistEnabled && !isValidAddressListInput(values.initialWhitelist)) {
    errors.initialWhitelist = t('tokenDividendCreation.errors.addressListInvalid')
  }

  if (!errors.totalSupply && values.decimals != null) {
    try {
      const totalSupplyAmount = parseUnits(values.totalSupply, values.decimals)

      if (!errors.minHoldingForDividend) {
        const minHoldingAmount = parseUnits(values.minHoldingForDividend, values.decimals)
        if (minHoldingAmount >= totalSupplyAmount) {
          errors.minHoldingForDividend = t('tokenDividendCreation.errors.valueMustBeLessThanSupply')
        }
      }

      if (!errors.dividendTriggerThreshold) {
        const dividendTriggerAmount = parseUnits(values.dividendTriggerThreshold, values.decimals)
        if (dividendTriggerAmount >= totalSupplyAmount) {
          errors.dividendTriggerThreshold = t('tokenDividendCreation.errors.valueMustBeLessThanSupply')
        }
      }
    } catch {
      if (!errors.minHoldingForDividend && values.minHoldingForDividend.trim()) {
        errors.minHoldingForDividend = t('tokenDividendCreation.errors.minHoldingInvalid')
      }
      if (!errors.dividendTriggerThreshold && values.dividendTriggerThreshold.trim()) {
        errors.dividendTriggerThreshold = t('tokenDividendCreation.errors.dividendTriggerThresholdInvalid')
      }
    }
  }

  return errors
}

export function formatDividendModeLabel(values: TokenDividendFormValues, t: (key: string) => string) {
  return values.isSameTokenDividend
    ? t('tokenDividendCreation.modes.sameToken')
    : t('tokenDividendCreation.modes.externalToken')
}

export function formatPoolTokenLabel(tokenAddress: string, poolTokens: TokenDisplayItem[], nativeSymbol: string) {
  const matchedToken = poolTokens.find((item) => normalizeAddress(item.address) === normalizeAddress(tokenAddress))
  if (matchedToken) {
    return matchedToken.isNative ? `${nativeSymbol} (${matchedToken.symbol})` : matchedToken.symbol
  }

  return formatAddressLabel(tokenAddress, nativeSymbol)
}

export function formatAddressLabel(value: string, nativeSymbol?: string) {
  if (!value) {
    return '--'
  }

  const normalized = normalizeAddress(value)
  if (normalized === ZERO_ADDRESS && nativeSymbol) {
    return `${nativeSymbol} (Native)`
  }

  return normalized
}

export function mergeTokenOptions(...lists: TokenDisplayItem[][]) {
  const tokenMap = new Map<string, TokenDisplayItem>()

  for (const list of lists) {
    for (const item of list) {
      if (!item?.address) {
        continue
      }

      const normalizedAddress = normalizeAddress(item.address)
      tokenMap.set(normalizedAddress, {
        ...tokenMap.get(normalizedAddress),
        ...item,
        address: normalizedAddress,
      })
    }
  }

  return Array.from(tokenMap.values())
}

export function getDefaultAutoProcessGasLimit(chainDefinition: ChainDefinition) {
  return AUTO_PROCESS_GAS_LIMIT_BY_CHAIN[chainDefinition.chainId] ?? DEFAULT_AUTO_PROCESS_GAS_LIMIT
}

function normalizeAddress(address: string) {
  const rawAddress = String(address).trim()

  try {
    return getAddress(rawAddress)
  } catch {
    return rawAddress
  }
}

function isValidPositiveDecimal(value: string) {
  if (!value.trim()) {
    return false
  }

  if (!/^\d+(\.\d+)?$/.test(value.trim())) {
    return false
  }

  return Number(value) > 0
}

function isValidTaxValue(value: string) {
  if (!value.trim()) {
    return true
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
    return false
  }

  const numericValue = Number(value)
  return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= MAX_DIVIDEND_TAX_PER_GROUP
}

function isValidAddressListInput(value: string) {
  const entries = value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return entries.every((item) => isAddress(item))
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
