import type { ChainDefinition } from '@/config/chains'

export type TokenCreationFormValues = {
  name: string
  symbol: string
  totalSupply: string
  decimals: number | null
}

export type TokenCreationFormErrors = Partial<Record<keyof TokenCreationFormValues, string>>

export type TokenCreationSubmitValues = Omit<TokenCreationFormValues, 'decimals'> & {
  decimals: number
}

export type TokenCreationStepStatus = 'loading' | 'success' | 'failed'

export type TokenCreationSubmitStep = {
  id: number
  status: TokenCreationStepStatus
}

export type TokenCreationSubmitResult = {
  txHash: string
  tokenAddress?: string
}

export type TokenCreationViewModel = {
  chainDefinition: ChainDefinition
  formValues: TokenCreationFormValues
  errors: TokenCreationFormErrors
  updateField: <Key extends keyof TokenCreationFormValues>(key: Key, value: TokenCreationFormValues[Key]) => void
  creationFee: bigint | null
  feeLoading: boolean
  loading: boolean
  submitStep: TokenCreationSubmitStep | null
  result: TokenCreationSubmitResult | null
  successModalOpen: boolean
  failureModalOpen: boolean
  onSubmit: () => Promise<void>
  onCancelFlow: () => void
  onCloseSuccessModal: () => void
  onCloseFailureModal: () => void
  onClearResult: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const defaultTokenCreationValues: TokenCreationFormValues = {
  name: '',
  symbol: '',
  totalSupply: '',
  decimals: 18,
}

export function validateTokenCreation(values: TokenCreationFormValues, t: (key: string) => string) {
  const errors: TokenCreationFormErrors = {}

  if (!values.name.trim()) {
    errors.name = t('tokenCreation.errors.nameRequired')
  } else if (values.name.trim().length > 100) {
    errors.name = t('tokenCreation.errors.nameTooLong')
  }

  if (!values.symbol.trim()) {
    errors.symbol = t('tokenCreation.errors.symbolRequired')
  } else if (values.symbol.trim().length > 100) {
    errors.symbol = t('tokenCreation.errors.symbolTooLong')
  }

  if (!values.totalSupply.trim()) {
    errors.totalSupply = t('tokenCreation.errors.supplyRequired')
  } else if (!/^\d+$/.test(values.totalSupply) || BigInt(values.totalSupply) <= 0n) {
    errors.totalSupply = t('tokenCreation.errors.supplyInvalid')
  }

  if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenCreation.errors.decimalsInvalid')
  }

  return errors
}
