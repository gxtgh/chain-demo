import { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { useAccount, useSwitchChain } from 'wagmi'
import type { ChainDefinition } from '@/config/chains'
import { getConnectorProvider } from '@/utils/wagmi-provider'
import { executeDividendManageWrite, resolveTokenManageErrorKey } from './tokenManageService'

type CurrentStep =
  | {
      id: number
      status: 'loading' | 'success' | 'failed'
    }
  | null

type ActionConfig = {
  key: string
  title: string
  functionName: string
  args: unknown[]
  successMessage: string
  failureMessage: string
}

export function useTokenManageActionRunner({
  chainDefinition,
  tokenAddress,
  t,
  onSuccess,
}: {
  chainDefinition: ChainDefinition
  tokenAddress: string
  t: (key: string, vars?: Record<string, string | number>) => string
  onSuccess: () => void
}) {
  const { isConnected, chainId, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [currentActionKey, setCurrentActionKey] = useState<string | null>(null)
  const [currentTitle, setCurrentTitle] = useState('')
  const [step, setStep] = useState<CurrentStep>(null)
  const [open, setOpen] = useState(false)
  const flowIdRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function reset() {
    clearTimer()
    setOpen(false)
    setStep(null)
    setCurrentActionKey(null)
    setCurrentTitle('')
  }

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [])

  async function runAction(config: ActionConfig) {
    if (!tokenAddress) {
      return
    }

    if (!isConnected) {
      message.warning(t('tokenManage.errors.walletRequired'))
      return
    }

    const flowId = flowIdRef.current + 1
    flowIdRef.current = flowId
    clearTimer()
    setCurrentActionKey(config.key)
    setCurrentTitle(config.title)
    setOpen(true)
    setStep({ id: 1, status: 'loading' })

    try {
      if (chainId !== chainDefinition.chainId) {
        await switchChainAsync({ chainId: chainDefinition.chainId })
      }

      if (flowIdRef.current !== flowId) {
        return
      }

      const walletProvider = await getConnectorProvider(connector, chainDefinition.chainId)
      if (!walletProvider) {
        throw new Error('tokenManage.errors.walletUnavailable')
      }

      setStep({ id: 2, status: 'loading' })
      await executeDividendManageWrite({
        chainDefinition,
        tokenAddress,
        walletProvider,
        functionName: config.functionName,
        args: config.args,
      })

      if (flowIdRef.current !== flowId) {
        return
      }

      setStep({ id: 3, status: 'success' })
      message.success(config.successMessage)
      onSuccess()
      timerRef.current = window.setTimeout(() => {
        if (flowIdRef.current !== flowId) {
          return
        }
        reset()
      }, 600)
    } catch (error) {
      if (flowIdRef.current !== flowId) {
        return
      }

      const errorKey = resolveTokenManageErrorKey(error)
      message.error(errorKey ? t(errorKey) : config.failureMessage)
      setStep((current: CurrentStep) => ({ id: current?.id ?? 1, status: 'failed' }))
      timerRef.current = window.setTimeout(() => {
        if (flowIdRef.current !== flowId) {
          return
        }
        reset()
      }, 900)
    }
  }

  return {
    currentActionKey,
    currentTitle,
    step,
    open,
    runAction,
    closeStatus: reset,
  }
}
