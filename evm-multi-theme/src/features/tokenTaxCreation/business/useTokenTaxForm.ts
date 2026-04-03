import { useEffect, useMemo, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import { getDefaultTokenTaxValues, type TokenTaxFormValues, validateTokenTax } from './model'

export function useTokenTaxForm(chainDefinition: ChainDefinition, t: (key: string) => string) {
  const defaults = useMemo(() => getDefaultTokenTaxValues(chainDefinition), [chainDefinition])
  const [formValues, setFormValues] = useState<TokenTaxFormValues>(defaults)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    setFormValues(defaults)
    setHasSubmitted(false)
  }, [defaults])

  const allErrors = useMemo(() => validateTokenTax(formValues, t), [formValues, t])
  const errors = hasSubmitted ? allErrors : {}

  function updateField<Key extends keyof TokenTaxFormValues>(key: Key, value: TokenTaxFormValues[Key]) {
    setFormValues((current) => {
      if (key === 'isSetTax' && value === false) {
        return {
          ...current,
          isSetTax: false,
          buyTax: '',
          sellTax: '',
          taxFeeReceiveAddress: '',
          exchange: defaults.exchange,
          poolToken: defaults.poolToken,
        }
      }

      return { ...current, [key]: value }
    })
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
