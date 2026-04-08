import { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { useAccount, useSwitchChain } from 'wagmi'
import type { ChainDefinition } from '@/config/chains'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import { readVanityFactorySnapshot, submitTokenVanityCreation } from './tokenVanityService'
import type { TokenVanitySubmitResult, TokenVanitySubmitStep, TokenVanitySubmitValues } from './model'

const defaultStep: TokenVanitySubmitStep | null = null

export function useTokenVanitySubmit(
  chainDefinition: ChainDefinition,
  t: (key: string) => string,
  validateBeforeSubmit: () => boolean,
) {
  const { isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [factoryAddress, setFactoryAddress] = useState<string>('')
  const [creationFee, setCreationFee] = useState<bigint | null>(null)
  const [tokenCreationCode, setTokenCreationCode] = useState<string | null>(null)
  const [feeLoading, setFeeLoading] = useState(true)
  const [creationCodeLoading, setCreationCodeLoading] = useState(true)
  const [resourceError, setResourceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitStep, setSubmitStep] = useState<TokenVanitySubmitStep | null>(defaultStep)
  const [result, setResult] = useState<TokenVanitySubmitResult | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [failureModalOpen, setFailureModalOpen] = useState(false)
  const flowIdRef = useRef(0)
  const modalTimerRef = useRef<number | null>(null)

  function clearModalTimer() {
    if (modalTimerRef.current !== null) {
      window.clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }
  }

  function isFlowActive(flowId: number) {
    return flowIdRef.current === flowId
  }

  function clearResult() {
    clearModalTimer()
    setLoading(false)
    setResult(null)
    setSuccessModalOpen(false)
    setFailureModalOpen(false)
    setSubmitStep(defaultStep)
  }

  function cancelFlow() {
    flowIdRef.current += 1
    clearModalTimer()
    setLoading(false)
    setResult(null)
    setSuccessModalOpen(false)
    setFailureModalOpen(false)
    setSubmitStep(defaultStep)
  }

  useEffect(() => {
    let active = true

    flowIdRef.current += 1
    clearModalTimer()
    setLoading(false)
    setFactoryAddress('')
    setCreationFee(null)
    setTokenCreationCode(null)
    setResourceError(null)
    setResult(null)
    setSuccessModalOpen(false)
    setFailureModalOpen(false)
    setSubmitStep(defaultStep)

    async function loadResources() {
      setFeeLoading(true)
      setCreationCodeLoading(true)

      try {
        const snapshot = await readVanityFactorySnapshot(chainDefinition)
        if (!active) return
        setFactoryAddress(snapshot.factoryAddress)
        setCreationFee(snapshot.creationFee)
        setTokenCreationCode(snapshot.tokenCreationCode)
        setResourceError(null)
      } catch (error) {
        if (!active) return
        const nextMessage = error instanceof Error && error.message.startsWith('tokenVanityCreation.errors.')
          ? t(error.message)
          : t('tokenVanityCreation.errors.factoryUnavailable')
        setFactoryAddress('')
        setCreationFee(null)
        setTokenCreationCode(null)
        setResourceError(nextMessage)
      } finally {
        if (active) {
          setFeeLoading(false)
          setCreationCodeLoading(false)
        }
      }
    }

    void loadResources()

    return () => {
      active = false
    }
  }, [chainDefinition, t])

  useEffect(() => {
    return () => {
      clearModalTimer()
    }
  }, [])

  async function submit(values: TokenVanitySubmitValues) {
    clearModalTimer()
    setResult(null)
    setFailureModalOpen(false)
    setSuccessModalOpen(false)

    if (!validateBeforeSubmit()) {
      return
    }

    if (!isConnected) {
      message.warning(t('tokenVanityCreation.errors.walletRequired'))
      return
    }

    const flowId = flowIdRef.current + 1
    flowIdRef.current = flowId
    setLoading(true)
    setSubmitStep({ id: 1, status: 'loading' })

    try {
      if (chainId !== chainDefinition.chainId) {
        await switchChainAsync({ chainId: chainDefinition.chainId })
      }

      if (!isFlowActive(flowId)) return

      const nextResult = await submitTokenVanityCreation(chainDefinition, values, {
        onWaitingWallet: () => {
          if (!isFlowActive(flowId)) return
          setSubmitStep({ id: 2, status: 'loading' })
        },
        onPending: () => {
          if (!isFlowActive(flowId)) return
          setSubmitStep({ id: 3, status: 'loading' })
        },
      })

      if (!isFlowActive(flowId)) return

      setLoading(false)
      setResult(nextResult)
      setSubmitStep({ id: 4, status: 'success' })
      modalTimerRef.current = window.setTimeout(() => {
        if (!isFlowActive(flowId)) return
        setSubmitStep(defaultStep)
        setSuccessModalOpen(true)
      }, 700)
    } catch (error) {
      if (!isFlowActive(flowId)) return

      if (isInsufficientFundsError(error)) {
        message.warning(t('tokenVanityCreation.errors.insufficientBalance'))
      } else if (error instanceof Error && error.message.startsWith('tokenVanityCreation.errors.')) {
        message.warning(t(error.message))
      }

      setLoading(false)
      setSubmitStep((prev) => ({ id: prev?.id ?? 4, status: 'failed' }))
      modalTimerRef.current = window.setTimeout(() => {
        if (!isFlowActive(flowId)) return
        setSubmitStep(defaultStep)
        setFailureModalOpen(true)
      }, 400)
    }
  }

  function closeSuccessModal() {
    setSuccessModalOpen(false)
  }

  function closeFailureModal() {
    setFailureModalOpen(false)
    setSubmitStep(defaultStep)
  }

  return {
    factoryAddress,
    creationFee,
    tokenCreationCode,
    feeLoading,
    creationCodeLoading,
    factoryAvailable: Boolean(factoryAddress && tokenCreationCode),
    resourceError,
    loading,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    submit,
    cancelFlow,
    clearResult,
    closeSuccessModal,
    closeFailureModal,
  }
}
