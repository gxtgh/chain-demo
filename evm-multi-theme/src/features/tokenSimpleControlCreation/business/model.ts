import { isAddress } from 'ethers'
import { parseUnits } from 'viem'
import type { ChainDefinition } from '@/config/chains'

export type TokenSimpleControlFormValues = {
  name: string
  symbol: string
  totalSupply: string
  decimals: number | null
  receiveAddress: string
  enableMint: boolean
  enablePause: boolean
  blacklistEnabled: boolean
  enableWalletLimit: boolean
  maxWalletAmount: string
}

export type TokenSimpleControlFormErrors = Partial<Record<keyof TokenSimpleControlFormValues, string>>

export type TokenSimpleControlSubmitValues = Omit<TokenSimpleControlFormValues, 'decimals'> & {
  decimals: number
}

export type TokenSimpleControlStepStatus = 'loading' | 'success' | 'failed'

export type TokenSimpleControlSubmitStep = {
  id: number
  status: TokenSimpleControlStepStatus
}

export type TokenSimpleControlSubmitResult = {
  txHash: string
  tokenAddress?: string
  receiveAddress: string
}

export type TokenSimpleControlViewModel = {
  chainDefinition: ChainDefinition
  connectedAddress: string
  formValues: TokenSimpleControlFormValues
  errors: TokenSimpleControlFormErrors
  creationFee: bigint | null
  feeLoading: boolean
  loading: boolean
  submitStep: TokenSimpleControlSubmitStep | null
  result: TokenSimpleControlSubmitResult | null
  successModalOpen: boolean
  failureModalOpen: boolean
  updateField: <Key extends keyof TokenSimpleControlFormValues>(key: Key, value: TokenSimpleControlFormValues[Key]) => void
  onUseConnectedAddress: () => void
  onSubmit: () => Promise<void>
  onCancelFlow: () => void
  onCloseSuccessModal: () => void
  onCloseFailureModal: () => void
  onClearResult: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const defaultTokenSimpleControlValues: TokenSimpleControlFormValues = {
  name: '',
  symbol: '',
  totalSupply: '',
  decimals: 18,
  receiveAddress: '',
  enableMint: false,
  enablePause: false,
  blacklistEnabled: false,
  enableWalletLimit: false,
  maxWalletAmount: '',
}

export function validateTokenSimpleControl(
  values: TokenSimpleControlFormValues,
  t: (key: string) => string,
) {
  const errors: TokenSimpleControlFormErrors = {}

  if (!values.name.trim()) {
    errors.name = t('tokenSimpleControlCreation.errors.nameRequired')
  } else if (values.name.trim().length > 100) {
    errors.name = t('tokenSimpleControlCreation.errors.nameTooLong')
  }

  if (!values.symbol.trim()) {
    errors.symbol = t('tokenSimpleControlCreation.errors.symbolRequired')
  } else if (values.symbol.trim().length > 100) {
    errors.symbol = t('tokenSimpleControlCreation.errors.symbolTooLong')
  }

  if (!isPositiveAmount(values.totalSupply)) {
    errors.totalSupply = values.totalSupply.trim()
      ? t('tokenSimpleControlCreation.errors.supplyInvalid')
      : t('tokenSimpleControlCreation.errors.supplyRequired')
  }

  if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenSimpleControlCreation.errors.decimalsInvalid')
  }

  if (!errors.totalSupply && values.decimals != null && Number.isInteger(values.decimals)) {
    try {
      if (parseUnits(values.totalSupply.trim(), values.decimals) <= 0n) {
        errors.totalSupply = t('tokenSimpleControlCreation.errors.supplyInvalid')
      }
    } catch {
      errors.totalSupply = t('tokenSimpleControlCreation.errors.supplyInvalid')
    }
  }

  if (values.receiveAddress.trim() && !isAddress(values.receiveAddress.trim())) {
    errors.receiveAddress = t('tokenSimpleControlCreation.errors.receiveAddressInvalid')
  }

  if (values.enableWalletLimit) {
    if (!isPositiveAmount(values.maxWalletAmount)) {
      errors.maxWalletAmount = values.maxWalletAmount.trim()
        ? t('tokenSimpleControlCreation.errors.maxWalletAmountInvalid')
        : t('tokenSimpleControlCreation.errors.maxWalletAmountRequired')
    } else if (values.decimals != null && isPositiveAmount(values.totalSupply)) {
      try {
        const supply = parseUnits(values.totalSupply.trim(), values.decimals)
        const maxWalletAmount = parseUnits(values.maxWalletAmount.trim(), values.decimals)
        if (maxWalletAmount <= 0n || maxWalletAmount > supply) {
          errors.maxWalletAmount = t('tokenSimpleControlCreation.errors.maxWalletAmountInvalid')
        }
      } catch {
        errors.maxWalletAmount = t('tokenSimpleControlCreation.errors.maxWalletAmountInvalid')
      }
    }
  }

  return errors
}

export function formatPermissionState(enabled: boolean, t: (key: string) => string) {
  return enabled ? t('tokenSimpleControlCreation.successSummary.enabled') : t('tokenSimpleControlCreation.successSummary.disabled')
}

function isPositiveAmount(value: string) {
  const normalized = value.trim()
  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) {
    return false
  }

  return Number.isFinite(Number(normalized)) && Number(normalized) > 0
}
