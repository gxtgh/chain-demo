import { useEffect, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import type { ChainDefinition } from '@/config/chains'
import { readCreationFee, submitTokenCreation } from './tokenCreationService'
import type { TokenCreationFormValues, TokenCreationSubmitPhase, TokenCreationSubmitResult } from './types'

export function useTokenCreationSubmit(
  chainDefinition: ChainDefinition,
  t: (key: string) => string,
  validateBeforeSubmit: () => boolean,
) {
  const { isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [creationFee, setCreationFee] = useState<bigint | null>(null)
  const [feeLoading, setFeeLoading] = useState(true)
  const [attemptCount, setAttemptCount] = useState(0)
  const [submitPhase, setSubmitPhase] = useState<TokenCreationSubmitPhase>('idle')
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<TokenCreationSubmitResult | null>(null)

  useEffect(() => {
    let active = true

    async function loadFee() {
      setFeeLoading(true)
      setSubmitPhase('loading_fee')
      setSubmitError('')

      try {
        const fee = await readCreationFee(chainDefinition)
        if (!active) return
        setCreationFee(fee)
        setSubmitPhase('idle')
      } catch {
        if (!active) return
        setCreationFee(null)
        setSubmitPhase('error')
        setSubmitError(t('tokenCreation.errors.factoryUnavailable'))
      } finally {
        if (active) {
          setFeeLoading(false)
        }
      }
    }

    void loadFee()

    return () => {
      active = false
    }
  }, [chainDefinition, t])

  async function submit(values: TokenCreationFormValues) {
    setSubmitError('')
    setResult(null)

    if (!validateBeforeSubmit()) {
      return
    }

    if (!isConnected) {
      setSubmitPhase('error')
      setSubmitError(t('tokenCreation.errors.walletRequired'))
      return
    }

    try {
      setAttemptCount((count) => count + 1)
      setSubmitPhase('preparing')

      if (chainId !== chainDefinition.chainId) {
        await switchChainAsync({ chainId: chainDefinition.chainId })
      }

      const nextResult = await submitTokenCreation(chainDefinition, values, {
        onWaitingWallet: () => setSubmitPhase('waiting_wallet'),
        onPending: () => setSubmitPhase('pending'),
      })

      setResult(nextResult)
      setSubmitPhase('success')
    } catch (error) {
      setSubmitPhase('error')
      const message =
        error instanceof Error && error.message.startsWith('tokenCreation.errors.')
          ? t(error.message)
          : error instanceof Error && error.message
            ? error.message
            : t('tokenCreation.errors.txFailed')
      setSubmitError(message)
    }
  }

  function resetSubmitState() {
    setSubmitError('')
    setResult(null)
    setSubmitPhase(feeLoading ? 'loading_fee' : 'idle')
  }

  return {
    creationFee,
    feeLoading,
    attemptCount,
    submitPhase,
    submitError,
    result,
    submit,
    resetSubmitState,
  }
}
