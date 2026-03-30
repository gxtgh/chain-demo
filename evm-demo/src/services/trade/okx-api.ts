import type { SupportedChainKey } from '../../config/chains'

type QuoteParams = {
  chainIndex: string
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  userWalletAddress: string
  slippagePercent?: string
}

type ApproveParams = {
  chainIndex: string
  tokenContractAddress: string
  approveAmount: string
}

type SwapParams = QuoteParams

type OkxEnvelope<T> = {
  code?: string
  msg?: string
  data?: T[]
}

export type OkxQuote = {
  chainIndex?: string
  fromTokenAmount?: string
  toTokenAmount?: string
  estimateGasFee?: string
  priceImpactPercentage?: string
  tradeFee?: string
  originToTokenAmount?: string
  routerResult?: unknown
}

export type OkxApproveTransaction = {
  data?: string
  dexContractAddress?: string
  gasLimit?: string
  gasPrice?: string
}

export type OkxSwapTransaction = {
  tx?: {
    from?: string
    to?: string
    data?: string
    value?: string
    gas?: string
    gasLimit?: string
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    minReceiveAmount?: string
  }
  routerResult?: unknown
  toTokenAmount?: string
  fromTokenAmount?: string
  estimateGasFee?: string
  priceImpactPercentage?: string
}

const OKX_BASE_URL = readEnv('VITE_OKX_BASE_URL') || 'https://web3.okx.com'

export function getOkxChainIndex(chain: SupportedChainKey) {
  if (chain === 'bsc') return '56'
  if (chain === 'eth') return '1'
  return '8453'
}

export async function getOkxQuote(params: QuoteParams) {
  const payload = await signedGet<OkxQuote>('dex/aggregator/quote', params)
  return payload
}

export async function getOkxApproveTransaction(params: ApproveParams) {
  const payload = await signedGet<OkxApproveTransaction>('dex/aggregator/approve-transaction', params)
  return payload
}

export async function getOkxSwapTransaction(params: SwapParams) {
  const payload = await signedGet<OkxSwapTransaction>('dex/aggregator/swap', params)
  return payload
}

async function signedGet<T>(path: string, params: Record<string, string>) {
  const apiKey = requireEnv('VITE_OKX_API_KEY')
  const secretKey = requireEnv('VITE_OKX_SECRET_KEY')
  const passphrase = requireEnv('VITE_OKX_PASSPHRASE')
  const requestPath = buildRequestPath(path, params)
  const timestamp = new Date().toISOString()
  const sign = await signOkxRequest(timestamp, 'GET', requestPath, '', secretKey)

  const response = await fetch(`${OKX_BASE_URL}${requestPath}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': passphrase,
    },
  })

  const payload = (await response.json()) as OkxEnvelope<T>
  if (!response.ok) {
    throw new Error(payload.msg || `OKX request failed with status ${response.status}.`)
  }
  if (payload.code && payload.code !== '0') {
    throw new Error(payload.msg || `OKX request failed with code ${payload.code}.`)
  }

  const [first] = payload.data ?? []
  if (!first) {
    throw new Error('OKX API returned an empty response.')
  }

  return first
}

function buildRequestPath(path: string, params: Record<string, string>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '') {
      search.set(key, value)
    }
  }
  return `/api/v6/${path}?${search.toString()}`
}

async function signOkxRequest(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string,
  secretKey: string,
) {
  const encoder = new TextEncoder()
  const message = `${timestamp}${method.toUpperCase()}${requestPath}${body}`
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return arrayBufferToBase64(signature)
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary)
}

function readEnv(key: 'VITE_OKX_BASE_URL' | 'VITE_OKX_API_KEY' | 'VITE_OKX_SECRET_KEY' | 'VITE_OKX_PASSPHRASE') {
  return import.meta.env[key] as string | undefined
}

function requireEnv(key: 'VITE_OKX_API_KEY' | 'VITE_OKX_SECRET_KEY' | 'VITE_OKX_PASSPHRASE') {
  const value = readEnv(key)
  if (!value) {
    throw new Error(`Missing ${key}.`)
  }
  return value
}
