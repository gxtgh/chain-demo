import { BrowserProvider, Contract, Interface, JsonRpcProvider, getAddress, isAddress } from 'ethers'
import type { EIP1193Provider } from 'viem'
import tokenDividendAbi from '@/assets/abi/TokenDividend.json'
import { getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import { getDynamicGasOverrides } from '@/utils/evm-gas'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import { readErc20Metadata } from '@/lib/token/erc20-metadata'
import {
  formatBasisPoints,
  formatBigIntUnits,
  normalizeTokenAddress,
  type DividendTokenManageInfo,
  type TokenDisplayInfo,
  type TokenManageType,
} from './model'

const tokenDividendInterface = new Interface(tokenDividendAbi)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export async function detectTokenType(chainDefinition: ChainDefinition, tokenAddress: string): Promise<TokenManageType | null> {
  const rpcUrl = getChainRpcUrl(chainDefinition)
  if (!rpcUrl || !isAddress(tokenAddress)) {
    return null
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(getAddress(tokenAddress), tokenDividendAbi, provider)

  const [isSameTokenDividend, receiveAddress, fundAddress] = await Promise.all([
    safeRead(contract, 'isSameTokenDividend'),
    safeRead(contract, 'receiveAddress'),
    safeRead(contract, 'fundAddress'),
  ])

  return typeof isSameTokenDividend === 'boolean' && isAddressValue(receiveAddress) && isAddressValue(fundAddress)
    ? 'dividend'
    : null
}

export async function loadDividendTokenManageInfo(
  chainDefinition: ChainDefinition,
  tokenAddress: string,
): Promise<DividendTokenManageInfo> {
  const rpcUrl = getChainRpcUrl(chainDefinition)
  if (!rpcUrl || !isAddress(tokenAddress)) {
    throw new Error('tokenManage.errors.invalidTokenAddress')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const normalizedAddress = getAddress(tokenAddress)
  const contract = new Contract(normalizedAddress, tokenDividendAbi, provider)

  const [
    nameResult,
    symbolResult,
    decimalsResult,
    totalSupplyResult,
    ownerResult,
    receiveAddressResult,
    fundAddressResult,
    swapRouterResult,
    legacySwapRouterResult,
    mainPairResult,
    legacyMainPairResult,
    basePoolTokenResult,
    isSameTokenDividendResult,
    dividendTokenResult,
    dividendTrackerResult,
    buyFundFeeResult,
    buyLPFeeResult,
    buyBurnFeeResult,
    buyDividendFeeResult,
    sellFundFeeResult,
    sellLPFeeResult,
    sellBurnFeeResult,
    sellDividendFeeResult,
    transferFundFeeResult,
    transferLPFeeResult,
    transferBurnFeeResult,
    transferDividendFeeResult,
    minHoldingForDividendResult,
    autoProcessGasLimitResult,
    dividendTriggerThresholdResult,
    pendingDividendsResult,
    totalDividendsDistributedResult,
    killBlockCountResult,
    tradingEnabledResult,
    manualTradingEnableResult,
    mintEnabledResult,
    blacklistEnabledResult,
    whitelistEnabledResult,
    initialSupplyResult,
    totalMintedResult,
    defaultExcludedAddressesResult,
    whitelistAddresses,
    blacklistAddresses,
  ] = await Promise.all([
    safeRead(contract, 'name'),
    safeRead(contract, 'symbol'),
    safeRead(contract, 'decimals'),
    safeRead(contract, 'totalSupply'),
    safeRead(contract, 'owner'),
    safeRead(contract, 'receiveAddress'),
    safeRead(contract, 'fundAddress'),
    safeRead(contract, '_swapRouter'),
    safeRead(contract, 'swapRouter'),
    safeRead(contract, '_mainPair'),
    safeRead(contract, 'mainPair'),
    safeRead(contract, 'basePoolToken'),
    safeRead(contract, 'isSameTokenDividend'),
    safeRead(contract, 'dividendToken'),
    safeRead(contract, 'dividendTracker'),
    safeRead(contract, 'buyFundFee'),
    safeRead(contract, 'buyLPFee'),
    safeRead(contract, 'buyBurnFee'),
    safeRead(contract, 'buyDividendFee'),
    safeRead(contract, 'sellFundFee'),
    safeRead(contract, 'sellLPFee'),
    safeRead(contract, 'sellBurnFee'),
    safeRead(contract, 'sellDividendFee'),
    safeRead(contract, 'transferFundFee'),
    safeRead(contract, 'transferLPFee'),
    safeRead(contract, 'transferBurnFee'),
    safeRead(contract, 'transferDividendFee'),
    safeRead(contract, 'minHoldingForDividend'),
    safeRead(contract, 'autoProcessGasLimit'),
    safeRead(contract, 'dividendTriggerThreshold'),
    safeRead(contract, 'pendingDividends'),
    safeRead(contract, 'getTotalDividendsDistributed'),
    safeRead(contract, 'killBlockCount'),
    safeRead(contract, 'tradingEnabled'),
    safeRead(contract, 'manualTradingEnable'),
    safeRead(contract, 'mintEnabled'),
    safeRead(contract, 'blacklistEnabled'),
    safeRead(contract, 'whitelistEnabled'),
    safeRead(contract, 'initialSupply'),
    safeRead(contract, 'totalMinted'),
    safeRead(contract, 'getDefaultExcludedAddresses'),
    readIndexedAddressList(contract, true),
    readIndexedAddressList(contract, false),
  ])

  const name = readRequiredString(nameResult)
  const symbol = readRequiredString(symbolResult)
  const decimals = readRequiredNumber(decimalsResult)
  const totalSupply = readRequiredBigInt(totalSupplyResult)
  const owner = readRequiredAddress(ownerResult)
  const receiveAddress = readRequiredAddress(receiveAddressResult)
  const fundAddress = readRequiredAddress(fundAddressResult)
  const basePoolToken = readRequiredAddress(basePoolTokenResult)
  const isSameTokenDividend = readRequiredBoolean(isSameTokenDividendResult)
  const dividendToken = readOptionalAddress(dividendTokenResult) ?? ZERO_ADDRESS
  const dividendTracker = readOptionalAddress(dividendTrackerResult) ?? ZERO_ADDRESS
  const swapRouter = readOptionalAddress(swapRouterResult) ?? readOptionalAddress(legacySwapRouterResult) ?? ZERO_ADDRESS
  const mainPair = readOptionalAddress(mainPairResult) ?? readOptionalAddress(legacyMainPairResult) ?? ZERO_ADDRESS
  const buyFundFee = readOptionalBigInt(buyFundFeeResult)
  const buyLPFee = readOptionalBigInt(buyLPFeeResult)
  const buyBurnFee = readOptionalBigInt(buyBurnFeeResult)
  const buyDividendFee = readOptionalBigInt(buyDividendFeeResult)
  const sellFundFee = readOptionalBigInt(sellFundFeeResult)
  const sellLPFee = readOptionalBigInt(sellLPFeeResult)
  const sellBurnFee = readOptionalBigInt(sellBurnFeeResult)
  const sellDividendFee = readOptionalBigInt(sellDividendFeeResult)
  const transferFundFee = readOptionalBigInt(transferFundFeeResult)
  const transferLPFee = readOptionalBigInt(transferLPFeeResult)
  const transferBurnFee = readOptionalBigInt(transferBurnFeeResult)
  const transferDividendFee = readOptionalBigInt(transferDividendFeeResult)
  const minHoldingForDividend = readOptionalBigInt(minHoldingForDividendResult)
  const autoProcessGasLimit = readOptionalBigInt(autoProcessGasLimitResult)
  const dividendTriggerThreshold = readOptionalBigInt(dividendTriggerThresholdResult)
  const pendingDividends = readOptionalBigInt(pendingDividendsResult)
  const totalDividendsDistributed = readOptionalBigInt(totalDividendsDistributedResult)
  const killBlockCount = readOptionalBigInt(killBlockCountResult)
  const tradingEnabled = readOptionalBoolean(tradingEnabledResult)
  const manualTradingEnable = readOptionalBoolean(manualTradingEnableResult)
  const mintEnabled = readOptionalBoolean(mintEnabledResult)
  const blacklistEnabled = readOptionalBoolean(blacklistEnabledResult)
  const whitelistEnabled = readOptionalBoolean(whitelistEnabledResult)
  const initialSupply = readOptionalBigInt(initialSupplyResult, totalSupply)
  const totalMinted = readOptionalBigInt(totalMintedResult)

  const rewardTokenInfo = await resolveTokenDisplayInfo(
    chainDefinition,
    isSameTokenDividend ? normalizedAddress : dividendToken,
    {
      fallbackName: name,
      fallbackSymbol: symbol,
      fallbackDecimals: decimals,
    },
  )
  const basePoolTokenInfo = await resolveTokenDisplayInfo(chainDefinition, basePoolToken)

  const protectedAddresses = dedupeAddresses([
    ...readAddressTuple(defaultExcludedAddressesResult),
    fundAddress,
  ])

  const totalSupplyDisplay = formatBigIntUnits(totalSupply, decimals)
  const initialSupplyDisplay = formatBigIntUnits(initialSupply, decimals)
  const totalMintedDisplay = formatBigIntUnits(totalMinted, decimals)
  const remainingMintable = initialSupply > totalMinted ? initialSupply - totalMinted : 0n

  return {
    type: 'dividend',
    address: normalizedAddress,
    name,
    symbol,
    decimals,
    totalSupply,
    totalSupplyDisplay,
    owner,
    receiveAddress,
    fundAddress,
    swapRouter,
    mainPair,
    basePoolToken,
    basePoolTokenInfo,
    isSameTokenDividend,
    dividendToken: isSameTokenDividend ? normalizedAddress : dividendToken,
    dividendTokenInfo: rewardTokenInfo,
    dividendTracker,
    buyFundFee,
    buyLPFee,
    buyBurnFee,
    buyDividendFee,
    sellFundFee,
    sellLPFee,
    sellBurnFee,
    sellDividendFee,
    transferFundFee,
    transferLPFee,
    transferBurnFee,
    transferDividendFee,
    minHoldingForDividend,
    minHoldingForDividendDisplay: formatBigIntUnits(minHoldingForDividend, decimals),
    autoProcessGasLimit,
    dividendTriggerThreshold,
    dividendTriggerThresholdDisplay: formatBigIntUnits(dividendTriggerThreshold, decimals),
    pendingDividends,
    pendingDividendsDisplay: formatBigIntUnits(pendingDividends, rewardTokenInfo?.decimals ?? decimals),
    totalDividendsDistributed,
    totalDividendsDistributedDisplay: formatBigIntUnits(totalDividendsDistributed, rewardTokenInfo?.decimals ?? decimals),
    killBlockCount,
    tradingEnabled,
    manualTradingEnable,
    mintEnabled,
    blacklistEnabled,
    whitelistEnabled,
    initialSupply,
    initialSupplyDisplay,
    totalMinted,
    totalMintedDisplay,
    remainingMintable,
    remainingMintableDisplay: formatBigIntUnits(remainingMintable, decimals),
    whitelistAddresses: dedupeAddresses(whitelistAddresses),
    blacklistAddresses: dedupeAddresses(blacklistAddresses),
    protectedAddresses,
  }
}

export async function queryWithdrawableDividend({
  chainDefinition,
  tokenAddress,
  account,
  rewardDecimals,
}: {
  chainDefinition: ChainDefinition
  tokenAddress: string
  account: string
  rewardDecimals: number
}) {
  const rpcUrl = getChainRpcUrl(chainDefinition)
  if (!rpcUrl || !isAddress(tokenAddress) || !isAddress(account)) {
    throw new Error('tokenManage.errors.invalidAddress')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(getAddress(tokenAddress), tokenDividendAbi, provider)
  const amount = (await contract.getWithdrawableDividend(getAddress(account))) as bigint
  return {
    rawAmount: amount,
    displayAmount: formatBigIntUnits(amount, rewardDecimals),
  }
}

export async function executeDividendManageWrite({
  chainDefinition,
  tokenAddress,
  walletProvider,
  functionName,
  args,
  onWaitingWallet,
  onPending,
}: {
  chainDefinition: ChainDefinition
  tokenAddress: string
  walletProvider: EIP1193Provider
  functionName: string
  args: unknown[]
  onWaitingWallet?: () => void
  onPending?: () => void
}) {
  if (!walletProvider || !isAddress(tokenAddress)) {
    throw new Error('tokenManage.errors.walletUnavailable')
  }

  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const contract = new Contract(getAddress(tokenAddress), tokenDividendAbi, signer)
  const gasEstimate = (await contract[functionName].estimateGas(...args)) as bigint
  const gasLimit = (gasEstimate * 12n) / 10n
  const overrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit)
  onWaitingWallet?.()
  const transaction = await contract[functionName](...args, overrides)
  onPending?.()
  const receipt = await transaction.wait()

  return {
    txHash: transaction.hash as string,
    receipt,
  }
}

export function resolveTokenManageErrorKey(error: unknown) {
  if (isInsufficientFundsError(error)) {
    return 'tokenManage.errors.insufficientBalance'
  }

  const revertData = findRevertData(error)
  if (!revertData) {
    return null
  }

  try {
    const parsed = tokenDividendInterface.parseError(revertData)
    const errorName = parsed?.name
    if (!errorName) {
      return null
    }

    const errorMap: Record<string, string> = {
      MintNotEnabled: 'tokenManage.errors.mintDisabled',
      MintAmountExceedsCap: 'tokenManage.errors.mintExceedsCap',
      InvalidState: 'tokenManage.errors.invalidState',
      ProtectedAddress: 'tokenManage.errors.protectedAddress',
      CanOnlySetWhenTradingClosed: 'tokenManage.errors.onlyWhenTradingClosed',
      ZeroAddress: 'tokenManage.errors.zeroAddress',
      FundDead: 'tokenManage.errors.fundAddressDead',
      MinHoldingMustBePositive: 'tokenManage.errors.minHoldingInvalid',
      TradingNotEnabled: 'tokenManage.errors.tradingNotEnabled',
      TaxRateTooHigh: 'tokenManage.errors.taxRateTooHigh',
      TaxTotalTooHigh: 'tokenManage.errors.taxTotalTooHigh',
      NotOwner: 'tokenManage.errors.noPermission',
      Unauthorized: 'tokenManage.errors.noPermission',
      Blacklisted: 'tokenManage.errors.blacklisted',
    }

    return errorMap[errorName] ?? null
  } catch {
    return null
  }
}

async function readIndexedAddressList(contract: Contract, isWhitelist: boolean) {
  const lengthResult = await safeRead(contract, 'getListLength', [isWhitelist])
  const length = Number(readOptionalBigInt(lengthResult))
  if (!Number.isFinite(length) || length <= 0) {
    return [] as string[]
  }

  const items = await Promise.all(
    Array.from({ length }, (_, index) => safeRead(contract, 'getListAt', [isWhitelist, BigInt(index)])),
  )

  return items.map((item) => readOptionalAddress(item)).filter((item): item is string => Boolean(item))
}

async function resolveTokenDisplayInfo(
  chainDefinition: ChainDefinition,
  tokenAddress: string,
  fallback?: {
    fallbackName?: string
    fallbackSymbol?: string
    fallbackDecimals?: number
  },
) {
  const knownToken = findKnownToken(chainDefinition, tokenAddress)
  if (knownToken) {
    return knownToken
  }

  try {
    const metadata = await readErc20Metadata(chainDefinition, tokenAddress)
    return {
      address: metadata.address,
      symbol: metadata.symbol,
      name: metadata.name,
      decimals: metadata.decimals,
    } satisfies TokenDisplayInfo
  } catch {
    if (fallback?.fallbackSymbol && fallback.fallbackDecimals != null) {
      return {
        address: getAddress(tokenAddress),
        symbol: fallback.fallbackSymbol,
        name: fallback.fallbackName,
        decimals: fallback.fallbackDecimals,
      } satisfies TokenDisplayInfo
    }
    return undefined
  }
}

function findKnownToken(chainDefinition: ChainDefinition, tokenAddress: string) {
  const normalized = normalizeTokenAddress(tokenAddress)
  const tokenList = [
    chainDefinition.nativeToken,
    chainDefinition.wtoken,
    ...(chainDefinition.stableCoins ?? []),
  ]

  const matched = tokenList.find((item) => normalizeTokenAddress(item.address) === normalized)
  if (!matched) {
    return undefined
  }

  return {
    address: getAddress(matched.address),
    symbol: matched.symbol,
    decimals: matched.decimals,
    name: matched.name,
    isNative: normalizeTokenAddress(matched.address) === normalizeTokenAddress(ZERO_ADDRESS),
  } satisfies TokenDisplayInfo
}

function dedupeAddresses(addresses: string[]) {
  const seen = new Set<string>()
  return addresses
    .filter((item) => isAddressValue(item))
    .map((item) => getAddress(item))
    .filter((item) => {
      const normalized = normalizeTokenAddress(item)
      if (seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })
}

async function safeRead(contract: Contract, functionName: string, args: unknown[] = []) {
  const target = contract[functionName]
  if (typeof target !== 'function') {
    return undefined
  }

  try {
    return await target(...args)
  } catch {
    return undefined
  }
}

function readRequiredString(value: unknown) {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  throw new Error('tokenManage.errors.loadFailed')
}

function readRequiredNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'bigint' ? Number(value) : Number.NaN
  if (Number.isFinite(parsed)) {
    return parsed
  }
  throw new Error('tokenManage.errors.loadFailed')
}

function readRequiredBigInt(value: unknown) {
  if (typeof value === 'bigint') {
    return value
  }
  throw new Error('tokenManage.errors.loadFailed')
}

function readRequiredAddress(value: unknown) {
  const parsed = readOptionalAddress(value)
  if (parsed) {
    return parsed
  }
  throw new Error('tokenManage.errors.loadFailed')
}

function readRequiredBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }
  throw new Error('tokenManage.errors.loadFailed')
}

function readOptionalAddress(value: unknown) {
  return isAddressValue(value) ? getAddress(value) : undefined
}

function readOptionalBigInt(value: unknown, fallback = 0n) {
  return typeof value === 'bigint' ? value : fallback
}

function readOptionalBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readAddressTuple(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => isAddressValue(item)) : []
}

function isAddressValue(value: unknown): value is string {
  return typeof value === 'string' && isAddress(value)
}

function findRevertData(value: unknown, depth = 0, seen = new WeakSet<object>()): string | null {
  if (depth > 4 || value == null) {
    return null
  }

  if (typeof value === 'string' && /^0x[0-9a-fA-F]+$/.test(value) && value.length >= 10) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findRevertData(item, depth + 1, seen)
      if (nested) {
        return nested
      }
    }
    return null
  }

  if (typeof value !== 'object') {
    return null
  }

  if (seen.has(value)) {
    return null
  }

  seen.add(value)
  const record = value as Record<string, unknown>
  for (const key of ['data', 'error', 'info', 'revert', 'payload', 'body']) {
    if (!(key in record)) {
      continue
    }
    const nested = findRevertData(record[key], depth + 1, seen)
    if (nested) {
      return nested
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nested = findRevertData(nestedValue, depth + 1, seen)
    if (nested) {
      return nested
    }
  }

  return null
}

export function buildTaxSummary(info: DividendTokenManageInfo, prefix: 'buy' | 'sell' | 'transfer') {
  const parts =
    prefix === 'buy'
      ? [info.buyFundFee, info.buyLPFee, info.buyBurnFee, info.buyDividendFee]
      : prefix === 'sell'
        ? [info.sellFundFee, info.sellLPFee, info.sellBurnFee, info.sellDividendFee]
        : [info.transferFundFee, info.transferLPFee, info.transferBurnFee, info.transferDividendFee]

  return `${parts.reduce((sum, item) => sum + Number(formatBasisPoints(item)), 0)}%`
}
