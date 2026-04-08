import type { ChainDefinition } from '@/config/chains'

export type TokenVanityFormValues = {
  name: string
  symbol: string
  totalSupply: string
  decimals: number | null
  prefix: string
  suffix: string
}

export type TokenVanityFormErrors = Partial<Record<keyof TokenVanityFormValues, string>>

export type TokenVanitySubmitValues = Omit<TokenVanityFormValues, 'decimals'> & {
  decimals: number
  salt: `0x${string}`
  predictedAddress: string
}

export type TokenVanityStepStatus = 'loading' | 'success' | 'failed'

export type TokenVanitySubmitStep = {
  id: number
  status: TokenVanityStepStatus
}

export type TokenVanitySubmitResult = {
  txHash: string
  tokenAddress?: string
  predictedAddress: string
  salt: `0x${string}`
}

export type VanitySearchStatus = 'idle' | 'searching' | 'success' | 'stopped'

export type VanitySearchMatch = {
  address: string
  salt: `0x${string}`
}

export type VanitySearchState = {
  status: VanitySearchStatus
  generatedCount: number
  speed: number
  progress: number
  estimatedSeconds: number | null
  difficulty: bigint
  match: VanitySearchMatch | null
}

export type TokenVanityViewModel = {
  chainDefinition: ChainDefinition
  formValues: TokenVanityFormValues
  errors: TokenVanityFormErrors
  updateField: <Key extends keyof TokenVanityFormValues>(key: Key, value: TokenVanityFormValues[Key]) => void
  creationFee: bigint | null
  feeLoading: boolean
  creationCodeLoading: boolean
  factoryAvailable: boolean
  resourceError: string | null
  loading: boolean
  search: VanitySearchState
  submitStep: TokenVanitySubmitStep | null
  result: TokenVanitySubmitResult | null
  successModalOpen: boolean
  failureModalOpen: boolean
  onStartGenerate: () => Promise<void>
  onStopGenerate: () => void
  onSubmit: () => Promise<void>
  onCancelFlow: () => void
  onCloseSuccessModal: () => void
  onCloseFailureModal: () => void
  onClearResult: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const defaultTokenVanityValues: TokenVanityFormValues = {
  name: '',
  symbol: '',
  totalSupply: '',
  decimals: 18,
  prefix: '',
  suffix: '',
}

export function validateTokenVanity(values: TokenVanityFormValues, t: (key: string) => string) {
  const errors: TokenVanityFormErrors = {}

  if (!values.name.trim()) {
    errors.name = t('tokenVanityCreation.errors.nameRequired')
  } else if (values.name.trim().length > 100) {
    errors.name = t('tokenVanityCreation.errors.nameTooLong')
  }

  if (!values.symbol.trim()) {
    errors.symbol = t('tokenVanityCreation.errors.symbolRequired')
  } else if (values.symbol.trim().length > 100) {
    errors.symbol = t('tokenVanityCreation.errors.symbolTooLong')
  }

  if (!values.totalSupply.trim()) {
    errors.totalSupply = t('tokenVanityCreation.errors.supplyRequired')
  } else if (!/^\d+$/.test(values.totalSupply)) {
    errors.totalSupply = t('tokenVanityCreation.errors.supplyInvalid')
  } else {
    try {
      if (BigInt(values.totalSupply) <= 0n) {
        errors.totalSupply = t('tokenVanityCreation.errors.supplyInvalid')
      }
    } catch {
      errors.totalSupply = t('tokenVanityCreation.errors.supplyInvalid')
    }
  }

  if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenVanityCreation.errors.decimalsInvalid')
  }

  const prefix = values.prefix.trim().toLowerCase()
  const suffix = values.suffix.trim().toLowerCase()

  if (!prefix && !suffix) {
    errors.prefix = t('tokenVanityCreation.errors.vanityRequired')
    errors.suffix = t('tokenVanityCreation.errors.vanityRequired')
  }

  if (prefix && !/^[0-9a-f]+$/.test(prefix)) {
    errors.prefix = t('tokenVanityCreation.errors.vanityInvalid')
  }

  if (suffix && !/^[0-9a-f]+$/.test(suffix)) {
    errors.suffix = t('tokenVanityCreation.errors.vanityInvalid')
  }

  if (prefix.length + suffix.length > 40) {
    errors.prefix = t('tokenVanityCreation.errors.vanityTooLong')
    errors.suffix = t('tokenVanityCreation.errors.vanityTooLong')
  }

  return errors
}
