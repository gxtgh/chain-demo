import { getAddress, isAddress } from 'ethers'
import type { TokenDisplayItem } from '@/components/common/token-display'
import type { ChainDefinition } from '@/config/chains'

export type TaxExchangeOption = {
  value: string
  label: string
  dex: string
  version?: string
  logo?: string
}

export type TokenTaxFormValues = {
  name: string
  symbol: string
  totalSupply: string
  decimals: number | null
  buyTax: string
  sellTax: string
  taxFeeReceiveAddress: string
  exchange: string
  poolToken: string
}

export type TokenTaxFormErrors = Partial<Record<keyof TokenTaxFormValues, string>>

export type TokenTaxSubmitValues = Omit<TokenTaxFormValues, 'decimals'> & {
  decimals: number
}

export type TokenTaxStepStatus = 'loading' | 'success' | 'failed'

export type TokenTaxSubmitStep = {
  id: number
  status: TokenTaxStepStatus
}

export type TokenTaxSubmitResult = {
  txHash: string
  tokenAddress?: string
  txExplorerUrl: string
  tokenExplorerUrl?: string
  taxReceiverAddress: string
}

export type TokenTaxViewModel = {
  chainDefinition: ChainDefinition
  formValues: TokenTaxFormValues
  errors: TokenTaxFormErrors
  exchanges: TaxExchangeOption[]
  poolTokens: TokenDisplayItem[]
  creationFee: bigint | null
  feeLoading: boolean
  loading: boolean
  submitStep: TokenTaxSubmitStep | null
  result: TokenTaxSubmitResult | null
  successModalOpen: boolean
  failureModalOpen: boolean
  updateField: <Key extends keyof TokenTaxFormValues>(key: Key, value: TokenTaxFormValues[Key]) => void
  onPoolTokenResolved: (token: TokenDisplayItem) => void
  onSubmit: () => Promise<void>
  onCancelFlow: () => void
  onCloseSuccessModal: () => void
  onCloseFailureModal: () => void
  onClearResult: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function getTaxExchangeOptions(chainDefinition: ChainDefinition): TaxExchangeOption[] {
  return chainDefinition.contractList
    .filter((contract) => contract.key === 'tokenTaxFactory' && contract.address)
    .map((contract) => {
      const dex = chainDefinition.dexs?.find(
        (item) => item.type === contract.dex && (item.version ?? 'v2') === (contract.version ?? 'v2'),
      )

      return {
        value: contract.address,
        label: dex?.name ?? `${contract.dex ?? 'Factory'} ${(contract.version ?? '').toUpperCase()}`.trim(),
        dex: contract.dex ?? dex?.type ?? 'Factory',
        version: contract.version ?? dex?.version,
        logo: dex?.logo,
      }
    })
}

export function buildPoolTokenOptions(chainDefinition: ChainDefinition): TokenDisplayItem[] {
  const nativeToken: TokenDisplayItem = {
    address: normalizeAddress(chainDefinition.nativeToken.address),
    name: chainDefinition.nativeToken.name ?? chainDefinition.nativeToken.symbol,
    symbol: chainDefinition.nativeToken.symbol,
    decimals: chainDefinition.nativeToken.decimals,
    logo: chainDefinition.nativeToken.logo,
    isNative: true,
  }

  const stableTokens =
    chainDefinition.stableCoins?.map((token) => ({
      address: normalizeAddress(token.address),
      name: token.name ?? token.symbol,
      symbol: token.symbol,
      decimals: token.decimals,
      logo: token.logo,
    })) ?? []

  return mergeTokenOptions([nativeToken], stableTokens)
}

export function getDefaultTokenTaxValues(chainDefinition: ChainDefinition): TokenTaxFormValues {
  const exchanges = getTaxExchangeOptions(chainDefinition)
  const poolTokens = buildPoolTokenOptions(chainDefinition)

  return {
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: 18,
    buyTax: '',
    sellTax: '',
    taxFeeReceiveAddress: '',
    exchange: exchanges[0]?.value ?? '',
    poolToken: poolTokens[0]?.address ?? '',
  }
}

export function validateTokenTax(values: TokenTaxFormValues, t: (key: string) => string) {
  const errors: TokenTaxFormErrors = {}

  if (!values.name.trim()) {
    errors.name = t('tokenTaxCreation.errors.nameRequired')
  } else if (values.name.trim().length > 100) {
    errors.name = t('tokenTaxCreation.errors.nameTooLong')
  }

  if (!values.symbol.trim()) {
    errors.symbol = t('tokenTaxCreation.errors.symbolRequired')
  } else if (values.symbol.trim().length > 100) {
    errors.symbol = t('tokenTaxCreation.errors.symbolTooLong')
  }

  if (!values.totalSupply.trim()) {
    errors.totalSupply = t('tokenTaxCreation.errors.supplyRequired')
  } else if (!/^\d+$/.test(values.totalSupply)) {
    errors.totalSupply = t('tokenTaxCreation.errors.supplyInvalid')
  } else {
    try {
      if (BigInt(values.totalSupply) <= 0n) {
        errors.totalSupply = t('tokenTaxCreation.errors.supplyInvalid')
      }
    } catch {
      errors.totalSupply = t('tokenTaxCreation.errors.supplyInvalid')
    }
  }

  if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenTaxCreation.errors.decimalsInvalid')
  }

  if (!isValidTaxRate(values.buyTax)) {
    errors.buyTax = t('tokenTaxCreation.errors.buyTaxInvalid')
  }

  if (!isValidTaxRate(values.sellTax)) {
    errors.sellTax = t('tokenTaxCreation.errors.sellTaxInvalid')
  }

  if (values.taxFeeReceiveAddress.trim() && !isAddress(values.taxFeeReceiveAddress.trim())) {
    errors.taxFeeReceiveAddress = t('tokenTaxCreation.errors.taxReceiverInvalid')
  }

  if (!values.exchange) {
    errors.exchange = t('tokenTaxCreation.errors.exchangeRequired')
  }

  if (!values.poolToken) {
    errors.poolToken = t('tokenTaxCreation.errors.poolTokenRequired')
  }

  return errors
}

export function formatTaxRate(value: string) {
  return value.trim() ? `${value}%` : '--'
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

function isValidTaxRate(value: string) {
  if (!value.trim()) {
    return false
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
    return false
  }

  const numericValue = Number(value)
  return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= 25
}

function normalizeAddress(address: string) {
  const rawAddress = String(address)
  try {
    return getAddress(rawAddress)
  } catch {
    return rawAddress.trim()
  }
}
