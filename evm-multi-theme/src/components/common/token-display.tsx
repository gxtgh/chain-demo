import { LoadingOutlined } from '@ant-design/icons'
import { message, Select, Spin } from 'antd'
import { getAddress, isAddress } from 'ethers'
import { type ReactNode, type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import { readErc20Metadata } from '@/lib/token/erc20-metadata'
import { formatText } from '@/utils'
import './token-display.scss'

const FALLBACK_ICON_SRC = '/img/common/icon-fallback.svg'

export type TokenDisplayItem = {
  address: string
  symbol: string
  decimals: number
  name?: string
  logo?: string
  isNative?: boolean
}

type TokenDisplayProps = {
  chainDefinition: ChainDefinition
  tokens: TokenDisplayItem[]
  value?: string
  placeholder?: string
  disabled?: boolean
  allowCustomAddress?: boolean
  emptyText?: string
  lookupErrorText?: string
  onChange: (value: string, token?: TokenDisplayItem) => void
  onTokenResolved?: (token: TokenDisplayItem) => void
}

export function TokenDisplay({
  chainDefinition,
  tokens,
  value,
  placeholder,
  disabled = false,
  allowCustomAddress = false,
  emptyText,
  lookupErrorText,
  onChange,
  onTokenResolved,
}: TokenDisplayProps) {
  const [searchValue, setSearchValue] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [resolvedTokens, setResolvedTokens] = useState<TokenDisplayItem[]>(tokens)
  const lookupSequenceRef = useRef(0)
  const onChangeRef = useRef(onChange)
  const onTokenResolvedRef = useRef(onTokenResolved)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onTokenResolvedRef.current = onTokenResolved
  }, [onTokenResolved])

  useEffect(() => {
    setResolvedTokens(mergeTokenLists(tokens))
  }, [chainDefinition.key, tokens])

  useEffect(() => {
    const trimmedSearch = searchValue.trim()
    if (!allowCustomAddress || !trimmedSearch || !isAddress(trimmedSearch)) {
      setLookupLoading(false)
      return
    }

    const normalizedAddress = getAddress(trimmedSearch)
    if (resolvedTokens.some((item) => normalizeTokenAddress(item.address) === normalizedAddress)) {
      setLookupLoading(false)
      return
    }

    const currentSequence = lookupSequenceRef.current + 1
    lookupSequenceRef.current = currentSequence
    setLookupLoading(true)

    const timeoutId = window.setTimeout(() => {
      void readErc20Metadata(chainDefinition, normalizedAddress)
        .then((metadata) => {
          if (lookupSequenceRef.current !== currentSequence) {
            return
          }

          const nextToken: TokenDisplayItem = {
            address: metadata.address,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
          }

          setResolvedTokens((current) => mergeTokenLists(current, [nextToken]))
          onTokenResolvedRef.current?.(nextToken)
          onChangeRef.current(nextToken.address, nextToken)
          setSearchValue('')
        })
        .catch(() => {
          if (lookupSequenceRef.current !== currentSequence) {
            return
          }

          if (lookupErrorText) {
            message.warning(lookupErrorText)
          }
        })
        .finally(() => {
          if (lookupSequenceRef.current === currentSequence) {
            setLookupLoading(false)
          }
        })
    }, 280)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [allowCustomAddress, chainDefinition, lookupErrorText, resolvedTokens, searchValue])

  const visibleTokens = useMemo(() => {
    const trimmedSearch = searchValue.trim().toLowerCase()
    if (!trimmedSearch || isAddress(trimmedSearch)) {
      return resolvedTokens
    }

    return resolvedTokens.filter((item) => {
      const haystacks = [item.symbol, item.name, item.address]
      return haystacks.some((candidate) => candidate?.toLowerCase().includes(trimmedSearch))
    })
  }, [resolvedTokens, searchValue])

  return (
    <Select
      className="token-display-select"
      disabled={disabled || lookupLoading}
      filterOption={false}
      popupClassName="token-display-dropdown"
      notFoundContent={
        lookupLoading ? (
          <div className="token-display-empty">
            <Spin indicator={<LoadingOutlined spin />} size="small" />
            <span>Searching token...</span>
          </div>
        ) : emptyText ? (
          <span className="token-display-empty">{emptyText}</span>
        ) : null
      }
      onChange={(nextValue) => {
        const nextToken = resolvedTokens.find((item) => normalizeTokenAddress(item.address) === normalizeTokenAddress(nextValue))
        onChange(nextValue, nextToken)
        setSearchValue('')
      }}
      onSearch={setSearchValue}
      optionLabelProp="label"
      placeholder={placeholder}
      showSearch
      value={value}
    >
      {visibleTokens.map((token) => (
        <Select.Option
          key={normalizeTokenAddress(token.address)}
          label={buildSelectedLabel(token)}
          value={token.address}
        >
          <div className="token-display-option">
            <div className="token-display-option-main">
              <TokenOptionIcon token={token} />
              <span className="token-display-option-symbol">{token.symbol}</span>
            </div>
            <span className="token-display-option-meta">{getTokenMetaLabel(token)}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}

function TokenOptionIcon({ token }: { token: TokenDisplayItem }) {
  if (token.logo) {
    return (
      <span className="token-display-option-icon" aria-hidden="true">
        <img alt={token.symbol} onError={handleAssetImageError} src={token.logo} />
      </span>
    )
  }

  return <span className="token-display-option-icon">{token.symbol.slice(0, 2).toUpperCase()}</span>
}

function buildSelectedLabel(token: TokenDisplayItem): ReactNode {
  return (
    <span className="token-display-selected">
      <TokenOptionIcon token={token} />
      <span className="token-display-selected-symbol">{token.symbol}</span>
      <span className="token-display-selected-divider">|</span>
      <span className="token-display-selected-meta">{getTokenMetaLabel(token)}</span>
    </span>
  )
}

function getTokenMetaLabel(token: TokenDisplayItem) {
  if (token.isNative) {
    return 'Native'
  }

  return formatText(token.address, 6, 4)
}

function handleAssetImageError(event: SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget
  target.onerror = null
  target.src = FALLBACK_ICON_SRC
}

function normalizeTokenAddress(address: string) {
  const rawAddress = String(address)
  try {
    return getAddress(rawAddress)
  } catch {
    return rawAddress.trim()
  }
}

function mergeTokenLists(...lists: TokenDisplayItem[][]) {
  const tokenMap = new Map<string, TokenDisplayItem>()

  for (const list of lists) {
    for (const item of list) {
      if (!item?.address) {
        continue
      }

      const key = normalizeTokenAddress(item.address)
      tokenMap.set(key, {
        ...tokenMap.get(key),
        ...item,
        address: key,
      })
    }
  }

  return Array.from(tokenMap.values())
}
