
import { formatEther } from 'ethers'

//字符串省略号截取
export function formatText(addr: string, s: number = 6, e: number = 4) {
  if (!addr) {
    return "";
  }
  const start = addr.substring(0, s);
  const end = addr.substring(addr.length - e, addr.length);
  addr = `${start}...${end}`;

  return addr;
}

export function formatNativeAmount(value: bigint) {
  const amount = formatEther(value)

  if (!amount.includes('.')) {
    return amount
  }

  return amount
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}

export function formatCompactNumber({
  value,
  minFractionDigits = 4,
  compactFractionDigits = 2,
}: {
  value: string | number | bigint | null | undefined
  minFractionDigits?: number
  compactFractionDigits?: number
}) {
  if (value == null || value === '') {
    return '--'
  }

  const numberValue = typeof value === 'bigint' ? Number(value) : Number(value)
  if (!Number.isFinite(numberValue)) {
    return String(value)
  }

  if (numberValue === 0) {
    return '0'
  }

  const safeMinFractionDigits = Math.max(0, Math.min(20, Math.trunc(minFractionDigits)))
  const safeCompactFractionDigits = Math.max(0, Math.min(20, Math.trunc(compactFractionDigits)))
  const absValue = Math.abs(numberValue)
  const minValue = 1 / 10 ** safeMinFractionDigits
  const minValueText = minValue.toFixed(safeMinFractionDigits)
  if (absValue <= minValue) {
    return numberValue < 0 ? `>=-${minValueText}` : `<=${minValueText}`
  }

  const units = [
    { value: 1_000_000_000_000, suffix: 'T' },
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'k' },
  ] as const

  const unit = units.find((item) => absValue >= item.value)
  if (!unit) {
    return trimNumberText(numberValue.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      useGrouping: false,
    }))
  }

  return `${trimNumberText(truncateNumber(numberValue / unit.value, safeCompactFractionDigits).toLocaleString('en-US', {
    maximumFractionDigits: safeCompactFractionDigits,
    useGrouping: false,
  }))}${unit.suffix}`
}

function trimNumberText(value: string) {
  return value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}

function truncateNumber(value: number, fractionDigits: number) {
  const multiplier = 10 ** fractionDigits
  return Math.trunc(value * multiplier) / multiplier
}
