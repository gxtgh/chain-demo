import { useEffect, useMemo, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import {
  getDefaultTokenDividendValues,
  type TokenDividendFormErrors,
  type TokenDividendFormValues,
  validateTokenDividend,
} from './model'

export function useTokenDividendForm(
  chainDefinition: ChainDefinition,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const defaults = useMemo(() => getDefaultTokenDividendValues(chainDefinition), [chainDefinition])
  const [formValues, setFormValues] = useState<TokenDividendFormValues>(defaults)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof TokenDividendFormValues, boolean>>>({})

  useEffect(() => {
    setFormValues(defaults)
    setHasSubmitted(false)
    setTouchedFields({})
  }, [defaults])

  const allErrors = useMemo(() => validateTokenDividend(formValues, t), [formValues, t])
  const errors = useMemo(() => {
    if (hasSubmitted) {
      return allErrors
    }

    const nextErrors: TokenDividendFormErrors = {}
    for (const [key, value] of Object.entries(allErrors) as Array<[keyof TokenDividendFormErrors, string]>) {
      if (key === 'taxConfiguration' || touchedFields[key as keyof TokenDividendFormValues]) {
        nextErrors[key] = value
      }
    }

    return nextErrors
  }, [allErrors, hasSubmitted, touchedFields])

  function updateField<Key extends keyof TokenDividendFormValues>(key: Key, value: TokenDividendFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }))
    setTouchedFields((current) => (current[key] ? current : { ...current, [key]: true }))
  }

  function markSubmitted() {
    setHasSubmitted(true)
  }

  return {
    formValues,
    errors,
    updateField,
    isValid: Object.keys(allErrors).length === 0,
    markSubmitted,
  }
}
