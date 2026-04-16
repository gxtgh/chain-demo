import { BrowserProvider, Contract, Interface, JsonRpcProvider, ZeroAddress, getAddress } from 'ethers'
import type { EIP1193Provider } from 'viem'
import { parseUnits } from 'viem'
import type { ChainDefinition } from '@/config/chains'
import { estimateMaxTransactionCost, getDynamicGasOverrides } from '@/utils/evm-gas'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import { getChainRpcUrl } from '@/config/chains'
import tokenDividendFactoryAbi from '@/assets/abi/TokenDividendFactory.json'
import type { TokenDividendSubmitResult, TokenDividendSubmitValues } from './model'
import { toBasisPoints } from './tax'

const dividendFactoryInterface = new Interface(tokenDividendFactoryAbi)
const tokenCreatedTopic = dividendFactoryInterface.getEvent('TokenCreated')!.topicHash

export async function readDividendCreationFee(chainDefinition: ChainDefinition, factoryAddress: string) {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !factoryAddress) {
    throw new Error('tokenDividendCreation.errors.factoryUnavailable')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(factoryAddress, tokenDividendFactoryAbi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenDividendCreation(
  chainDefinition: ChainDefinition,
  factoryAddress: string,
  values: TokenDividendSubmitValues,
  walletProvider: EIP1193Provider,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenDividendSubmitResult> {
  if (!walletProvider) {
    throw new Error('tokenDividendCreation.errors.walletUnavailable')
  }

  if (!factoryAddress) {
    throw new Error('tokenDividendCreation.errors.factoryUnavailable')
  }

  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const contract = new Contract(factoryAddress, tokenDividendFactoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const walletBalance = await browserProvider.getBalance(signerAddress)

  if (walletBalance < creationFee) {
    throw new Error('tokenDividendCreation.errors.insufficientBalance')
  }

  const receiveAddress = values.receiveAddress.trim() || signerAddress
  const fundAddress = values.fundAddress.trim() || signerAddress
  const basePoolToken = resolveWrappedTokenAddress(chainDefinition, values.poolToken)
  const rewardTokenAddress = values.isSameTokenDividend
    ? ZeroAddress
    : resolveWrappedTokenAddress(chainDefinition, values.dividendToken)

  const submitParams = {
    name: values.name.trim(),
    symbol: values.symbol.trim(),
    decimals: values.decimals,
    totalSupply: BigInt(values.totalSupply),
    receiveAddress,
    fundAddress,
    swapRouter: values.swapRouter,
    basePoolToken,
    buyRates: buildTaxRateArray(values, 'buy'),
    sellRates: buildTaxRateArray(values, 'sell'),
    transferRates: buildTaxRateArray(values, 'transfer'),
    minHoldingForDividend: parseUnits(values.minHoldingForDividend, values.decimals),
    dividendTriggerThreshold: parseUnits(values.dividendTriggerThreshold, values.decimals),
    autoProcessGasLimit: BigInt(values.autoProcessGasLimit),
    killBlockCount: values.manualTradingEnable && values.killBlockCount.trim() ? BigInt(values.killBlockCount) : 0n,
    mintEnabled: values.mintEnabled,
    manualTradingEnable: values.manualTradingEnable,
    blacklistEnabled: values.blacklistEnabled,
    whitelistEnabled: values.whitelistEnabled,
    initialBlacklist: parseAddressList(values.initialBlacklist),
    initialWhitelist: parseAddressList(values.initialWhitelist),
    isSameTokenDividend: values.isSameTokenDividend,
    dividendToken: rewardTokenAddress,
  }

  let gasEstimate: bigint
  try {
    gasEstimate = (await contract.createDividendAllToken.estimateGas(submitParams, {
      value: creationFee,
    })) as bigint
  } catch (error) {
    if (isInsufficientFundsError(error)) {
      throw new Error('tokenDividendCreation.errors.insufficientBalance')
    }

    throw error
  }

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const estimatedMaxCost = estimateMaxTransactionCost(gasOverrides)

  if (walletBalance < estimatedMaxCost) {
    throw new Error('tokenDividendCreation.errors.insufficientBalance')
  }

  const transaction = await contract.createDividendAllToken(submitParams, gasOverrides)
  options?.onPending?.()
  const receipt = await transaction.wait()

  let tokenAddress: string | undefined
  for (const log of receipt?.logs ?? []) {
    if (log.topics?.[0] !== tokenCreatedTopic) {
      continue
    }

    try {
      const parsed = dividendFactoryInterface.parseLog(log)
      if (parsed?.name === 'TokenCreated') {
        tokenAddress = getAddress(parsed.args.tokenAddress as string)
        break
      }
    } catch {
      continue
    }
  }

  return {
    txHash: transaction.hash,
    tokenAddress,
    receiveAddress,
    fundAddress,
  }
}

export function resolveDividendCreationErrorKey(error: unknown) {
  if (error instanceof Error && error.message.startsWith('tokenDividendCreation.errors.')) {
    return error.message
  }

  const revertData = findRevertData(error)
  if (!revertData) {
    return null
  }

  try {
    const parsed = dividendFactoryInterface.parseError(revertData)
    const errorName = parsed?.name
    if (!errorName) {
      return null
    }

    const errorMap: Record<string, string> = {
      FactoryInvalidDividendToken: 'tokenDividendCreation.errors.dividendTokenRequired',
      FactoryDeploymentFailed: 'tokenDividendCreation.errors.factoryDeploymentFailed',
      FactoryMinHoldingMustBePositive: 'tokenDividendCreation.errors.minHoldingInvalid',
      FactoryDividendThresholdMustBePositive: 'tokenDividendCreation.errors.dividendTriggerThresholdInvalid',
      FactoryAutoProcessGasLimitMustBePositive: 'tokenDividendCreation.errors.autoProcessGasLimitInvalid',
      FactoryZeroReceive: 'tokenDividendCreation.errors.receiveAddressRequired',
      FactoryZeroFund: 'tokenDividendCreation.errors.fundAddressRequired',
      FactoryZeroBase: 'tokenDividendCreation.errors.poolTokenRequired',
      FactoryZeroRouter: 'tokenDividendCreation.errors.exchangeRequired',
      FactoryZeroSupply: 'tokenDividendCreation.errors.supplyInvalid',
      FactoryEmptyName: 'tokenDividendCreation.errors.nameRequired',
      FactoryEmptySymbol: 'tokenDividendCreation.errors.symbolRequired',
      FactoryDecimalsOverflow: 'tokenDividendCreation.errors.decimalsInvalid',
      FactoryFundDead: 'tokenDividendCreation.errors.fundAddressDead',
      FactoryInsufficientFee: 'tokenDividendCreation.errors.insufficientBalance',
    }

    return errorMap[errorName] ?? null
  } catch {
    return null
  }
}

function resolveWrappedTokenAddress(chainDefinition: ChainDefinition, tokenAddress: string) {
  return tokenAddress === ZeroAddress ? chainDefinition.wtoken.address : tokenAddress
}

function buildTaxRateArray(values: TokenDividendSubmitValues, prefix: 'buy' | 'sell' | 'transfer') {
  return [
    toBasisPoints(values[`${prefix}MarketingTax`]),
    toBasisPoints(values[`${prefix}ReflowTax`]),
    toBasisPoints(values[`${prefix}BurnTax`]),
    toBasisPoints(values[`${prefix}DividendTax`]),
  ]
}

function parseAddressList(value: string) {
  const deduped = new Set<string>()

  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => getAddress(item))
    .filter((item) => {
      const normalized = item.toLowerCase()
      if (deduped.has(normalized)) {
        return false
      }
      deduped.add(normalized)
      return true
    })
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
