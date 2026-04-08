import { useMemo, useState } from 'react'
import { defaultTokenVanityValues, type TokenVanityFormValues, validateTokenVanity } from './model'

export function useTokenVanityForm(t: (key: string) => string) {
  const [formValues, setFormValues] = useState<TokenVanityFormValues>(defaultTokenVanityValues)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const allErrors = useMemo(() => validateTokenVanity(formValues, t), [formValues, t])
  const errors = hasSubmitted ? allErrors : {}

  function updateField<Key extends keyof TokenVanityFormValues>(key: Key, value: TokenVanityFormValues[Key]) {
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
    markSubmitted,
  }
}
