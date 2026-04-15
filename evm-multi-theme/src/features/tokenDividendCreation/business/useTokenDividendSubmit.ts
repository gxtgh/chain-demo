import { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { useAccount, useSwitchChain } from 'wagmi'
import type { ChainDefinition } from '@/config/chains'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import { getConnectorProvider } from '@/utils/wagmi-provider'
import {
  readDividendCreationFee,
  resolveDividendCreationErrorKey,
  submitTokenDividendCreation,
} from './tokenDividendCreationService'
import type { TokenDividendSubmitResult, TokenDividendSubmitStep, TokenDividendSubmitValues } from './model'

const defaultStep: TokenDividendSubmitStep | null = null

export function useTokenDividendSubmit(
  chainDefinition: ChainDefinition,
  factoryAddress: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
  validateBeforeSubmit: () => boolean,
) {
  const { isConnected, chainId, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [creationFee, setCreationFee] = useState<bigint | null>(null)
  const [feeLoading, setFeeLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitStep, setSubmitStep] = useState<TokenDividendSubmitStep | null>(defaultStep)
  const [result, setResult] = useState<TokenDividendSubmitResult | null>(null)
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
    setCreationFee(null)
    setResult(null)
    setSuccessModalOpen(false)
    setFailureModalOpen(false)
    setSubmitStep(defaultStep)

    async function loadFee() {
      if (!factoryAddress) {
        setFeeLoading(false)
        setCreationFee(null)
        return
      }

      setFeeLoading(true)
      try {
        const fee = await readDividendCreationFee(chainDefinition, factoryAddress)
        if (!active) {
          return
        }
        setCreationFee(fee)
      } catch {
        if (!active) {
          return
        }
        setCreationFee(null)
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
  }, [chainDefinition, factoryAddress])

  useEffect(() => {
    return () => {
      clearModalTimer()
    }
  }, [])

  async function submit(values: TokenDividendSubmitValues) {
    clearModalTimer()
    setResult(null)
    setFailureModalOpen(false)
    setSuccessModalOpen(false)

    if (!validateBeforeSubmit()) {
      return
    }

    if (!isConnected) {
      message.warning(t('tokenDividendCreation.errors.walletRequired'))
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

      if (!isFlowActive(flowId)) {
        return
      }

      const walletProvider = await getConnectorProvider(connector, chainDefinition.chainId)
      if (!walletProvider) {
        throw new Error('tokenDividendCreation.errors.walletUnavailable')
      }

      const nextResult = await submitTokenDividendCreation(chainDefinition, factoryAddress, values, walletProvider, {
        onWaitingWallet: () => {
          if (!isFlowActive(flowId)) {
            return
          }
          setSubmitStep({ id: 2, status: 'loading' })
        },
        onPending: () => {
          if (!isFlowActive(flowId)) {
            return
          }
          setSubmitStep({ id: 3, status: 'loading' })
        },
      })

      if (!isFlowActive(flowId)) {
        return
      }

      setLoading(false)
      setResult(nextResult)
      setSubmitStep({ id: 4, status: 'success' })
      modalTimerRef.current = window.setTimeout(() => {
        if (!isFlowActive(flowId)) {
          return
        }
        setSubmitStep(defaultStep)
        setSuccessModalOpen(true)
      }, 600)
    } catch (error) {
      if (!isFlowActive(flowId)) {
        return
      }

      const errorKey = resolveDividendCreationErrorKey(error)
      if (isInsufficientFundsError(error)) {
        message.warning(t('tokenDividendCreation.errors.insufficientBalance'))
      } else if (errorKey) {
        message.warning(t(errorKey))
      }

      setLoading(false)
      setSubmitStep((prev) => ({ id: prev?.id ?? 4, status: 'failed' }))
      modalTimerRef.current = window.setTimeout(() => {
        if (!isFlowActive(flowId)) {
          return
        }
        setSubmitStep(defaultStep)
        setFailureModalOpen(true)
      }, 300)
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
    creationFee,
    feeLoading,
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
