import { useMemo, useState } from 'react'
import {
  defaultTokenSimpleControlValues,
  type TokenSimpleControlFormErrors,
  type TokenSimpleControlFormValues,
  validateTokenSimpleControl,
} from './model'

export function useTokenSimpleControlForm(t: (key: string) => string) {
  const [formValues, setFormValues] = useState<TokenSimpleControlFormValues>(() => ({ ...defaultTokenSimpleControlValues }))
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof TokenSimpleControlFormValues, boolean>>>({})

  const allErrors = useMemo(() => validateTokenSimpleControl(formValues, t), [formValues, t])
  const errors = useMemo(() => {
    if (hasSubmitted) {
      return allErrors
    }

    const nextErrors: TokenSimpleControlFormErrors = {}

    for (const [key, value] of Object.entries(allErrors) as Array<[keyof TokenSimpleControlFormValues, string]>) {
      if (touchedFields[key]) {
        nextErrors[key] = value
      }
    }

    return nextErrors
  }, [allErrors, hasSubmitted, touchedFields])

  function updateField<Key extends keyof TokenSimpleControlFormValues>(key: Key, value: TokenSimpleControlFormValues[Key]) {
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
