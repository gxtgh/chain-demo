import { useEffect, useMemo, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import { getDefaultTokenTaxValues, type TokenTaxFormErrors, type TokenTaxFormValues, validateTokenTax } from './model'

export function useTokenTaxForm(chainDefinition: ChainDefinition, t: (key: string) => string) {
  const defaults = useMemo(() => getDefaultTokenTaxValues(chainDefinition), [chainDefinition])
  const [formValues, setFormValues] = useState<TokenTaxFormValues>(defaults)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof TokenTaxFormValues, boolean>>>({})

  useEffect(() => {
    setFormValues(defaults)
    setHasSubmitted(false)
    setTouchedFields({})
  }, [defaults])

  const allErrors = useMemo(() => validateTokenTax(formValues, t), [formValues, t])
  const errors = useMemo(() => {
    if (hasSubmitted) {
      return allErrors
    }

    const nextErrors: TokenTaxFormErrors = {}

    for (const [key, value] of Object.entries(allErrors) as Array<[keyof TokenTaxFormValues, string]>) {
      if (touchedFields[key]) {
        nextErrors[key] = value
      }
    }

    return nextErrors
  }, [allErrors, hasSubmitted, touchedFields])

  function updateField<Key extends keyof TokenTaxFormValues>(key: Key, value: TokenTaxFormValues[Key]) {
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
