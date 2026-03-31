import type { TokenCreationFormErrors, TokenCreationFormValues } from './types'

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

  if (!Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) {
    errors.decimals = t('tokenCreation.errors.decimalsInvalid')
  }

  return errors
}
