import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  getAddress,
  http,
  parseUnits,
  type Address,
  type Hex,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import type { ChainConfig } from '../../config/chains'

export const OKX_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const

const WRAPPED_NATIVE_TOKEN_BY_CHAIN: Record<ChainConfig['key'], Address> = {
  bsc: getAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
  eth: getAddress('0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2'),
  base: getAddress('0x4200000000000000000000000000000000000006'),
}

type TradeClients = {
  account: ReturnType<typeof privateKeyToAccount>
  publicClient: ReturnType<typeof createPublicClient>
  walletClient: ReturnType<typeof createWalletClient>
}

export type TokenMetadata = {
  address: Address
  decimals: number
  symbol: string
  isNative: boolean
  sourceAddress: Address
}

export function createTradeClients(chainConfig: ChainConfig, rawPrivateKey: string): TradeClients {
  const privateKey = normalizePrivateKey(rawPrivateKey)
  const account = privateKeyToAccount(privateKey)
  const chain = defineChain({
    id: chainConfig.chainId,
    name: chainConfig.name,
    nativeCurrency: chainConfig.nativeCurrency,
    rpcUrls: {
      default: {
        http: chainConfig.rpcUrls,
      },
      public: {
        http: chainConfig.rpcUrls,
      },
    },
    blockExplorers: {
      default: {
        name: chainConfig.name,
        url: chainConfig.blockExplorerUrls[0],
      },
    },
  })

  const transport = http(chainConfig.rpcUrls[0])
  const publicClient = createPublicClient({ chain, transport })
  const walletClient = createWalletClient({ account, chain, transport })

  return { account, publicClient, walletClient }
}

export async function getTokenMetadata(publicClient: TradeClients['publicClient'], tokenAddress: string) {
  const address = getAddress(tokenAddress)
  const [decimals, symbol] = await Promise.all([
    publicClient.readContract({
      address,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
    publicClient.readContract({
      address,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
  ])

  return {
    address,
    decimals,
    symbol,
    isNative: false,
    sourceAddress: address,
  } satisfies TokenMetadata
}

export async function resolveTradeTokenMetadata(
  publicClient: TradeClients['publicClient'],
  chainConfig: ChainConfig,
  tokenAddress: string,
  options?: {
    preferWrappedNativeAsNative?: boolean
  },
) {
  const sourceAddress = getAddress(tokenAddress)
  if (isNativeTokenAlias(chainConfig, sourceAddress, options)) {
    return {
      address: getAddress(OKX_NATIVE_TOKEN_ADDRESS),
      decimals: chainConfig.nativeCurrency.decimals,
      symbol: chainConfig.nativeCurrency.symbol,
      isNative: true,
      sourceAddress,
    } satisfies TokenMetadata
  }

  return getTokenMetadata(publicClient, sourceAddress)
}

export function isNativeTokenAlias(
  chainConfig: ChainConfig,
  tokenAddress: string,
  options?: {
    preferWrappedNativeAsNative?: boolean
  },
) {
  const address = getAddress(tokenAddress)
  if (address.toLowerCase() === OKX_NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    return true
  }

  if (options?.preferWrappedNativeAsNative === false) {
    return false
  }

  return address.toLowerCase() === WRAPPED_NATIVE_TOKEN_BY_CHAIN[chainConfig.key].toLowerCase()
}

export function toAtomicAmount(amount: string, decimals: number) {
  return parseUnits(amount, decimals)
}

export function toHumanAmount(amount: string | bigint | undefined, decimals: number) {
  if (amount == null) return '--'
  return formatUnits(typeof amount === 'string' ? BigInt(amount) : amount, decimals)
}

export async function getAllowance(
  publicClient: TradeClients['publicClient'],
  tokenAddress: Address,
  owner: Address,
  spender: Address,
) {
  return publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })
}

export async function sendPreparedTransaction(
  clients: TradeClients,
  tx: {
    to: string
    data?: string
    value?: string
    gas?: string
    gasLimit?: string
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
  },
) {
  const baseRequest = {
    account: clients.account,
    to: getAddress(tx.to),
    data: tx.data as Hex | undefined,
    value: tx.value ? BigInt(tx.value) : undefined,
    gas: tx.gasLimit ? BigInt(tx.gasLimit) : tx.gas ? BigInt(tx.gas) : undefined,
  }

  let hash: Hex

  if (tx.gasPrice) {
    hash = await clients.walletClient.sendTransaction({
      ...baseRequest,
      chain: clients.walletClient.chain,
      gasPrice: BigInt(tx.gasPrice),
    })
  } else {
    hash = await clients.walletClient.sendTransaction({
      ...baseRequest,
      chain: clients.walletClient.chain,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? BigInt(tx.maxPriorityFeePerGas) : undefined,
      maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
    })
  }

  const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
  return {
    hash,
    receipt,
  }
}

function normalizePrivateKey(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error('Private key is required.')
  }
  return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`) as Hex
}
