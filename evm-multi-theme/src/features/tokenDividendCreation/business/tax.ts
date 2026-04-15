export const DIVIDEND_TAX_PREFIXES = ['buy', 'sell', 'transfer'] as const
export const DIVIDEND_TAX_SUFFIXES = ['MarketingTax', 'ReflowTax', 'BurnTax', 'DividendTax'] as const

export type DividendTaxPrefix = (typeof DIVIDEND_TAX_PREFIXES)[number]
export type DividendTaxSuffix = (typeof DIVIDEND_TAX_SUFFIXES)[number]
export type DividendTaxFieldKey = `${DividendTaxPrefix}${DividendTaxSuffix}`

export const MAX_DIVIDEND_TAX_PER_GROUP = 25
export const MAX_DIVIDEND_TAX_TOTAL = 75
export const MEDIUM_DIVIDEND_TAX_HINT = 15

export function calcDividendTaxCategoryTotal(
  values: Partial<Record<DividendTaxFieldKey, string>>,
  prefix: DividendTaxPrefix,
) {
  const total = DIVIDEND_TAX_SUFFIXES.reduce((sum, suffix) => {
    const rawValue = values[`${prefix}${suffix}`]
    return sum + normalizeTaxValue(rawValue)
  }, 0)

  return roundTaxValue(total)
}

export function calcDividendTaxGrandTotal(values: Partial<Record<DividendTaxFieldKey, string>>) {
  const total = DIVIDEND_TAX_PREFIXES.reduce((sum, prefix) => {
    return sum + calcDividendTaxCategoryTotal(values, prefix)
  }, 0)

  return roundTaxValue(total)
}

export function toBasisPoints(value: string) {
  if (!value.trim()) {
    return 0n
  }

  return BigInt(Math.round(Number(value) * 100))
}

export function formatTaxPercent(value: string) {
  const numericValue = normalizeTaxValue(value)
  return `${trimTrailingZeros(numericValue.toFixed(2))}%`
}

export function normalizeTaxInput(value: string) {
  if (!value.trim()) {
    return ''
  }

  const normalized = value.replace(/[^\d.]/g, '')
  const [integerPart, decimalPart = ''] = normalized.split('.')
  if (!integerPart && !decimalPart) {
    return ''
  }

  const nextIntegerPart = integerPart.replace(/^0+(?=\d)/, '') || '0'
  if (normalized.includes('.')) {
    return `${nextIntegerPart}.${decimalPart.slice(0, 2)}`
  }

  return nextIntegerPart
}

export function isValidTaxInput(value: string) {
  if (!value.trim()) {
    return true
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
    return false
  }

  const numericValue = Number(value)
  return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= MAX_DIVIDEND_TAX_PER_GROUP
}

function normalizeTaxValue(value?: string) {
  if (!value?.trim()) {
    return 0
  }

  const numericValue = Number(value)
  if (Number.isNaN(numericValue) || !Number.isFinite(numericValue)) {
    return 0
  }

  return numericValue
}

function roundTaxValue(value: number) {
  return Math.round(value * 100) / 100
}

function trimTrailingZeros(value: string) {
  return value.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').replace(/\.$/, '')
}
