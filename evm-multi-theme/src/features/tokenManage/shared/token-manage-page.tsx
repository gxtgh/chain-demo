import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import { useAccount } from 'wagmi'
import { useRouteContext } from '@/app/use-route-context'
import { resolveTokenManageRole } from '../business/model'
import { useTokenManage } from '../business/useTokenManage'
import { useTokenManageActionRunner } from '../business/useTokenManageActionRunner'
import { TokenManageShell } from './token-manage-shell'
import { tokenManageRendererRegistry } from '../tokenTypes'
import '@/features/tokenCreation/styles.scss'
import './styles.scss'

export function TokenManagePage() {
  const { t, lang, chain, chainDefinition, hasThemeQuery, themeColor } = useRouteContext()
  const { address, isConnected } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tokenAddressInput, setTokenAddressInput] = useState(searchParams.get('address')?.trim() ?? '')
  const tokenAddress = normalizeManagedAddress(searchParams.get('address'))
  const tokenState = useTokenManage(chainDefinition, tokenAddress)
  const connectedAddress = String(address ?? '')
  const role =
    tokenState.tokenType === 'dividend'
      ? resolveTokenManageRole({
          owner: tokenState.tokenInfo.owner,
          fundAddress: tokenState.tokenInfo.fundAddress,
          connectedAddress,
        })
      : 'viewer'

  useEffect(() => {
    setTokenAddressInput(searchParams.get('address')?.trim() ?? '')
  }, [searchParams])

  const runner = useTokenManageActionRunner({
    chainDefinition,
    tokenAddress,
    t,
    onSuccess: tokenState.refetch,
  })

  function handleLoadToken() {
    const normalized = normalizeManagedAddress(tokenAddressInput)
    if (!normalized) {
      message.warning(t('tokenManage.errors.invalidTokenAddress'))
      return
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('address', normalized)
      return next
    })
  }

  function handleClearToken() {
    setTokenAddressInput('')
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('address')
      return next
    })
  }

  const renderer =
    tokenState.tokenType && tokenState.tokenType in tokenManageRendererRegistry
      ? tokenManageRendererRegistry[tokenState.tokenType]
      : null

  return (
    <TokenManageShell
      lang={lang}
      chain={chain}
      hasThemeQuery={hasThemeQuery}
      themeColor={themeColor}
      chainDefinition={chainDefinition}
      tokenAddressInput={tokenAddressInput}
      setTokenAddressInput={setTokenAddressInput}
      onLoadToken={handleLoadToken}
      onClearToken={handleClearToken}
      tokenAddress={tokenAddress}
      isLoading={tokenState.isLoading}
      isError={tokenState.isError}
      errorKey={tokenState.errorKey}
      t={t}
    >
      {renderer && tokenState.tokenType === 'dividend'
        ? renderer({
            chainDefinition,
            info: tokenState.tokenInfo,
            role,
            isConnected,
            t,
            runner,
          })
        : null}
    </TokenManageShell>
  )
}

function normalizeManagedAddress(value?: string | null) {
  const nextValue = value?.trim() ?? ''
  return isValidAddress(nextValue) ? nextValue : ''
}

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}
