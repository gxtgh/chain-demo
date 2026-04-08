import { LoadingOutlined } from '@ant-design/icons'
import { message, Select, Spin } from 'antd'
import { getAddress, isAddress } from 'ethers'
import { type ReactNode, type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { ChainDefinition } from '@/config/chains'
import { isTokenMetadataLookupError, readErc20Metadata } from '@/lib/token/erc20-metadata'
import { formatText } from '@/utils'
import './index.scss'

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
  status?: 'error' | 'warning'
  disabled?: boolean
  allowCustomAddress?: boolean
  emptyText?: string
  lookupErrorText?: string
  noTokenInfoText?: string
  searchingText?: string
  nativeLabel?: string
  onChange: (value: string, token?: TokenDisplayItem) => void
  onTokenResolved?: (token: TokenDisplayItem) => void
}

type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; address: string }
  | { status: 'not-found'; address: string }

export function TokenDisplay({
  chainDefinition,
  tokens,
  value,
  placeholder,
  status,
  disabled = false,
  allowCustomAddress = false,
  emptyText,
  lookupErrorText,
  noTokenInfoText,
  searchingText = 'Searching token...',
  nativeLabel = 'Native',
  onChange,
  onTokenResolved,
}: TokenDisplayProps) {
  const [searchValue, setSearchValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' })
  const [fetchedTokens, setFetchedTokens] = useState<TokenDisplayItem[]>([])
  const lookupSequenceRef = useRef(0)
  const onTokenResolvedRef = useRef(onTokenResolved)

  useEffect(() => {
    onTokenResolvedRef.current = onTokenResolved
  }, [onTokenResolved])

  const resolvedTokens = useMemo(() => mergeTokenLists(tokens, fetchedTokens), [fetchedTokens, tokens])

  const trimmedSearch = searchValue.trim()
  const normalizedSearchAddress = useMemo(() => {
    if (!trimmedSearch || !isAddress(trimmedSearch)) {
      return null
    }

    return getAddress(trimmedSearch)
  }, [trimmedSearch])

  const hasLocalAddressMatch = useMemo(() => {
    if (!normalizedSearchAddress) {
      return false
    }

    return resolvedTokens.some((item) => normalizeTokenAddress(item.address) === normalizedSearchAddress)
  }, [normalizedSearchAddress, resolvedTokens])

  useEffect(() => {
    if (!allowCustomAddress || !normalizedSearchAddress || hasLocalAddressMatch) {
      lookupSequenceRef.current += 1
      return
    }

    const currentSequence = lookupSequenceRef.current + 1
    lookupSequenceRef.current = currentSequence
    let disposed = false
    const loadingFrameId = window.requestAnimationFrame(() => {
      if (disposed || lookupSequenceRef.current !== currentSequence) {
        return
      }

      setLookupState({ status: 'loading', address: normalizedSearchAddress })
    })

    const timeoutId = window.setTimeout(() => {
      void readErc20Metadata(chainDefinition, normalizedSearchAddress)
        .then((metadata) => {
          if (disposed || lookupSequenceRef.current !== currentSequence) {
            return
          }

          const nextToken: TokenDisplayItem = {
            address: metadata.address,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
          }

          setFetchedTokens((current) => mergeTokenLists(current, [nextToken]))
          onTokenResolvedRef.current?.(nextToken)
          setLookupState({ status: 'idle' })
        })
        .catch((error) => {
          if (disposed || lookupSequenceRef.current !== currentSequence) {
            return
          }

          if (isTokenMetadataLookupError(error, 'NOT_FOUND')) {
            setLookupState({ status: 'not-found', address: normalizedSearchAddress })
            return
          }

          setLookupState({ status: 'idle' })
          if (lookupErrorText) {
            message.warning(lookupErrorText)
          }
        })
    }, 280)

    return () => {
      disposed = true
      window.cancelAnimationFrame(loadingFrameId)
      window.clearTimeout(timeoutId)
    }
  }, [allowCustomAddress, chainDefinition, hasLocalAddressMatch, lookupErrorText, normalizedSearchAddress])

  const visibleTokens = useMemo(() => {
    const nextSearch = searchValue.trim()
    if (!nextSearch) {
      return resolvedTokens
    }

    if (isAddress(nextSearch)) {
      const normalizedAddress = normalizeTokenAddress(nextSearch)
      return resolvedTokens.filter((item) => normalizeTokenAddress(item.address) === normalizedAddress)
    }

    const loweredSearch = String(nextSearch).toLowerCase()

    return resolvedTokens.filter((item) => {
      const haystacks: string[] = [item.symbol, item.address]
      if (item.name) {
        haystacks.push(item.name)
      }

      return haystacks.some((candidate) => candidate.toLowerCase().includes(loweredSearch))
    })
  }, [resolvedTokens, searchValue])

  const lookupLoading =
    lookupState.status === 'loading' && Boolean(normalizedSearchAddress) && lookupState.address === normalizedSearchAddress
  const tokenNotFound =
    lookupState.status === 'not-found' && Boolean(normalizedSearchAddress) && lookupState.address === normalizedSearchAddress
  const displayValue = searchValue ? undefined : value

  return (
    <Select
      className="token-display-select"
      disabled={disabled}
      filterOption={false}
      open={disabled ? false : dropdownOpen}
      status={status}
      classNames={{
        popup: {
          root: "token-display-dropdown"
        }
      }}
      notFoundContent={
        lookupLoading ? (
          <div className="token-display-empty">
            <Spin indicator={<LoadingOutlined spin />} size="small" />
            <span>{searchingText}</span>
          </div>
        ) : tokenNotFound && noTokenInfoText ? (
          <span className="token-display-empty">{noTokenInfoText}</span>
        ) : emptyText ? (
          <span className="token-display-empty">{emptyText}</span>
        ) : null
      }
      onChange={(nextValue) => {
        const nextToken = resolvedTokens.find((item) => normalizeTokenAddress(item.address) === normalizeTokenAddress(nextValue))
        onChange(nextValue, nextToken)
        resetLookupState({
          setDropdownOpen,
          setLookupState,
          setSearchValue,
          lookupSequenceRef,
        })
      }}
      onOpenChange={(nextOpen) => {
        setDropdownOpen(nextOpen)
        if (!nextOpen) {
          resetLookupState({
            setDropdownOpen,
            setLookupState,
            setSearchValue,
            lookupSequenceRef,
          })
        }
      }}
      onSearch={(nextSearchValue) => {
        setDropdownOpen(true)
        setSearchValue(nextSearchValue)
      }}
      optionLabelProp="label"
      placeholder={placeholder}
      searchValue={searchValue}
      showSearch
      value={displayValue}
    >
      {visibleTokens.map((token) => (
        <Select.Option
          key={normalizeTokenAddress(token.address)}
          label={buildSelectedLabel(token, nativeLabel)}
          value={token.address}
        >
          <div className="token-display-option">
            <div className="token-display-option-main">
              <TokenOptionIcon token={token} />
              <span className="token-display-option-symbol">{token.symbol}</span>
            </div>
            <span className="token-display-option-meta">{getTokenMetaLabel(token, nativeLabel)}</span>
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

function buildSelectedLabel(token: TokenDisplayItem, nativeLabel: string): ReactNode {
  return (
    <span className="token-display-selected">
      <TokenOptionIcon token={token} />
      <span className="token-display-selected-symbol">{token.symbol}</span>
      <span className="token-display-selected-divider">|</span>
      <span className="token-display-selected-meta">{getTokenMetaLabel(token, nativeLabel)}</span>
    </span>
  )
}

function getTokenMetaLabel(token: TokenDisplayItem, nativeLabel: string) {
  if (token.isNative) {
    return nativeLabel
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

function resetLookupState({
  setDropdownOpen,
  setLookupState,
  setSearchValue,
  lookupSequenceRef,
}: {
  setDropdownOpen: (open: boolean) => void
  setLookupState: (state: LookupState) => void
  setSearchValue: (value: string) => void
  lookupSequenceRef: React.MutableRefObject<number>
}) {
  lookupSequenceRef.current += 1
  setDropdownOpen(false)
  setLookupState({ status: 'idle' })
  setSearchValue('')
}
