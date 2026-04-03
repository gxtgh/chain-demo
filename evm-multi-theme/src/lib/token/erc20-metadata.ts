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

export async function readErc20Metadata(chainDefinition: ChainDefinition, address: string): Promise<ResolvedTokenMetadata> {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !isAddress(address)) {
    throw new Error('tokenTaxCreation.errors.tokenLookupFailed')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(getAddress(address), erc20MetadataAbi, provider)

  const [name, symbol, decimals] = await Promise.all([
    contract.name() as Promise<string>,
    contract.symbol() as Promise<string>,
    contract.decimals() as Promise<number>,
  ])

  if (!name || !symbol || typeof decimals !== 'number') {
    throw new Error('tokenTaxCreation.errors.tokenLookupFailed')
  }

  return {
    address: getAddress(address) as `0x${string}`,
    name,
    symbol,
    decimals,
  }
}
