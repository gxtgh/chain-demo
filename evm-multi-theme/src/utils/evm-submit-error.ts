export function isInsufficientFundsError(error: unknown) {
  const candidates = collectErrorStrings(error)

  return candidates.some((item) =>
    /insufficient funds|insufficient_balance|funds for gas \* price \+ value|exceeds the balance|insufficient balance for transfer/i.test(item),
  )
}

function collectErrorStrings(error: unknown) {
  if (!error || typeof error !== 'object') {
    return []
  }

  const raw = error as {
    code?: string
    message?: string
    shortMessage?: string
    reason?: string
    info?: {
      error?: {
        code?: string
        message?: string
      }
      payload?: {
        error?: {
          code?: string
          message?: string
        }
      }
    }
  }

  return [
    raw.code,
    raw.message,
    raw.shortMessage,
    raw.reason,
    raw.info?.error?.code,
    raw.info?.error?.message,
    raw.info?.payload?.error?.code,
    raw.info?.payload?.error?.message,
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
}
