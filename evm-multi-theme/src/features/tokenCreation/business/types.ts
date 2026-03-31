import type { ChainDefinition } from '@/config/chains'

export type TokenCreationFormValues = {
  name: string
  symbol: string
  totalSupply: string
  decimals: number
}

export type TokenCreationFormErrors = Partial<Record<keyof TokenCreationFormValues, string>>

export type TokenCreationSubmitPhase =
  | 'idle'
  | 'loading_fee'
  | 'preparing'
  | 'waiting_wallet'
  | 'pending'
  | 'success'
  | 'error'

export type TokenCreationSubmitResult = {
  txHash: string
  tokenAddress?: string
  explorerUrl: string
}

export type TokenCreationViewModel = {
  chainDefinition: ChainDefinition
  formValues: TokenCreationFormValues
  errors: TokenCreationFormErrors
  updateField: <Key extends keyof TokenCreationFormValues>(key: Key, value: TokenCreationFormValues[Key]) => void
  creationFee: bigint | null
  feeLoading: boolean
  attemptCount: number
  submitPhase: TokenCreationSubmitPhase
  submitError: string
  result: TokenCreationSubmitResult | null
  onSubmit: () => Promise<void>
  resetSubmitState: () => void
  hasSubmitted: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
}
