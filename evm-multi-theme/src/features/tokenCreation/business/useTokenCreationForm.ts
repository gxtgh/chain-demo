import { useMemo, useState } from 'react'
import { defaultTokenCreationValues, type TokenCreationFormValues, validateTokenCreation } from './model'

export function useTokenCreationForm(t: (key: string) => string) {
  const [formValues, setFormValues] = useState<TokenCreationFormValues>(defaultTokenCreationValues)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const allErrors = useMemo(() => validateTokenCreation(formValues, t), [formValues, t])
  const errors = hasSubmitted ? allErrors : {}

  function updateField<Key extends keyof TokenCreationFormValues>(key: Key, value: TokenCreationFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }))
  }

  function markSubmitted() {
    setHasSubmitted(true)
  }

  return {
    formValues,
    errors,
    updateField,
    isValid: Object.keys(allErrors).length === 0,
    hasSubmitted,
    markSubmitted,
  }
}
