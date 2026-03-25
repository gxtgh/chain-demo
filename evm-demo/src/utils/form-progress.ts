export type FormValue = string | boolean

export type FormIssue = {
  field: string
  label: string
  message: string
}

export type FormFieldDescriptor<T extends Record<string, FormValue>> = {
  key: keyof T
  label: string
  required?: boolean
  trackProgress?: boolean
  validate?: (value: T[keyof T], form: T) => string | null
  recommend?: (value: T[keyof T], form: T) => string | null
}

export type FormProgress = {
  completionPercent: number
  completedCount: number
  totalCount: number
  requiredCompleted: number
  requiredTotal: number
  missingRequired: FormIssue[]
  invalidFields: FormIssue[]
  recommendations: FormIssue[]
}

export function analyzeFormProgress<T extends Record<string, FormValue>>(
  form: T,
  descriptors: Array<FormFieldDescriptor<T>>,
) {
  const trackedFields = descriptors.filter((descriptor) => descriptor.trackProgress !== false)
  const requiredFields = descriptors.filter((descriptor) => descriptor.required)

  let completedCount = 0
  let requiredCompleted = 0

  const missingRequired: FormIssue[] = []
  const invalidFields: FormIssue[] = []
  const recommendations: FormIssue[] = []

  for (const descriptor of descriptors) {
    const value = form[descriptor.key]
    const hasCurrentValue = hasValue(value)

    if (descriptor.trackProgress !== false && hasCurrentValue) {
      completedCount += 1
    }

    if (descriptor.required) {
      if (hasCurrentValue) {
        requiredCompleted += 1
      } else {
        missingRequired.push({
          field: String(descriptor.key),
          label: descriptor.label,
          message: `${descriptor.label} is required.`,
        })
        continue
      }
    }

    if (descriptor.validate && hasCurrentValue) {
      const message = descriptor.validate(value, form)
      if (message) {
        invalidFields.push({
          field: String(descriptor.key),
          label: descriptor.label,
          message,
        })
      }
    }

    if (descriptor.recommend) {
      const message = descriptor.recommend(value, form)
      if (message) {
        recommendations.push({
          field: String(descriptor.key),
          label: descriptor.label,
          message,
        })
      }
    }
  }

  return {
    completionPercent:
      trackedFields.length === 0 ? 0 : Math.round((completedCount / trackedFields.length) * 100),
    completedCount,
    totalCount: trackedFields.length,
    requiredCompleted,
    requiredTotal: requiredFields.length,
    missingRequired,
    invalidFields,
    recommendations,
  } satisfies FormProgress
}

export function isNonEmptyString(value: FormValue) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isPositiveNumber(value: string) {
  const normalized = value.replaceAll(',', '').trim()
  if (!normalized) return false
  const numericValue = Number(normalized)
  return Number.isFinite(numericValue) && numericValue > 0
}

export function isIntegerInRange(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value.trim())) return false
  const numericValue = Number(value)
  return numericValue >= min && numericValue <= max
}

export function isNumberInRange(value: string, min: number, max: number) {
  const numericValue = Number(value.trim())
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max
}

function hasValue(value: FormValue) {
  if (typeof value === 'boolean') {
    return true
  }

  return value.trim().length > 0
}
