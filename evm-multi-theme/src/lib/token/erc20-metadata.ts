import { Contract, JsonRpcProvider, getAddress, isAddress } from 'ethers'
import { getChainRpcUrl, type ChainDefinition } from '@/config/chains'

const erc20MetadataAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]

export type ResolvedTokenMetadata = {
  address: `0x${string}`
  name: string
  symbol: string
  decimals: number
}

export class TokenMetadataLookupError extends Error {
  code: 'NOT_FOUND' | 'UNAVAILABLE'

  constructor(code: 'NOT_FOUND' | 'UNAVAILABLE') {
    super(code)
    this.name = 'TokenMetadataLookupError'
    this.code = code
  }
}

export async function readErc20Metadata(chainDefinition: ChainDefinition, address: string): Promise<ResolvedTokenMetadata> {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !isAddress(address)) {
    throw new TokenMetadataLookupError('UNAVAILABLE')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(getAddress(address), erc20MetadataAbi, provider)

  let name: string
  let symbol: string
  let decimals: bigint | number

  try {
    ;[name, symbol, decimals] = await Promise.all([
      contract.name() as Promise<string>,
      contract.symbol() as Promise<string>,
      contract.decimals() as Promise<bigint | number>,
    ])
  } catch (error) {
    if (isRpcUnavailableError(error)) {
      throw new TokenMetadataLookupError('UNAVAILABLE')
    }

    throw new TokenMetadataLookupError('NOT_FOUND')
  }

  const resolvedDecimals = normalizeTokenDecimals(decimals)

  if (!name || !symbol || resolvedDecimals == null) {
    throw new TokenMetadataLookupError('NOT_FOUND')
  }

  return {
    address: getAddress(address) as `0x${string}`,
    name,
    symbol,
    decimals: resolvedDecimals,
  }
}

export function isTokenMetadataLookupError(error: unknown, code?: TokenMetadataLookupError['code']) {
  return error instanceof TokenMetadataLookupError && (!code || error.code === code)
}

function isRpcUnavailableError(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false
  }

  const code = String(error.code)
  return code === 'NETWORK_ERROR' || code === 'SERVER_ERROR' || code === 'TIMEOUT' || code === 'TIMEOUT_ERROR'
}

function normalizeTokenDecimals(value: unknown) {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : null
  }

  if (typeof value === 'bigint') {
    if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
      return null
    }

    return Number(value)
  }

  return null
}
