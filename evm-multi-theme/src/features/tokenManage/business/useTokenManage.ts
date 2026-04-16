import { useEffect, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import { detectTokenType, loadDividendTokenManageInfo } from './tokenManageService'
import type { TokenManageState } from './model'

export function useTokenManage(chainDefinition: ChainDefinition, tokenAddress: string) {
  const [state, setState] = useState<TokenManageState>({
    tokenType: null,
    isLoading: false,
    isError: false,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!tokenAddress) {
        setState({
          tokenType: null,
          isLoading: false,
          isError: false,
        })
        return
      }

      setState((current) => ({
        ...current,
        isLoading: true,
        isError: false,
      }))

      try {
        const tokenType = await detectTokenType(chainDefinition, tokenAddress)
        if (cancelled) {
          return
        }

        if (tokenType !== 'dividend') {
          setState({
            tokenType: null,
            isLoading: false,
            isError: true,
            errorKey: 'tokenManage.errors.unsupportedTokenType',
          })
          return
        }

        const tokenInfo = await loadDividendTokenManageInfo(chainDefinition, tokenAddress)
        if (cancelled) {
          return
        }

        setState({
          tokenType: 'dividend',
          tokenInfo,
          isLoading: false,
          isError: false,
        })
      } catch {
        if (cancelled) {
          return
        }
        setState({
          tokenType: null,
          isLoading: false,
          isError: true,
          errorKey: 'tokenManage.errors.loadFailed',
        })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [chainDefinition, refreshKey, tokenAddress])

  function refetch() {
    setRefreshKey((current) => current + 1)
  }

  return {
    ...state,
    refetch,
  }
}
