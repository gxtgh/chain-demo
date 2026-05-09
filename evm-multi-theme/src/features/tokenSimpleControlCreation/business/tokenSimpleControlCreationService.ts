import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers'
import type { EIP1193Provider } from 'viem'
import { parseUnits } from 'viem'
import { getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import { estimateMaxTransactionCost, getDynamicGasOverrides } from '@/utils/evm-gas'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import simpleControlTokenAbi from '@/assets/abi/SimpleControlToken.json'
import simpleControlTokenFactoryAbi from '@/assets/abi/SimpleControlTokenFactory.json'
import type { TokenSimpleControlSubmitResult, TokenSimpleControlSubmitValues } from './model'

const factoryInterface = new Interface(simpleControlTokenFactoryAbi)
const tokenInterface = new Interface(simpleControlTokenAbi)

export async function readSimpleControlCreationFee(chainDefinition: ChainDefinition, factoryAddress: string) {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !factoryAddress) {
    throw new Error('tokenSimpleControlCreation.errors.factoryUnavailable')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(factoryAddress, simpleControlTokenFactoryAbi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenSimpleControlCreation(
  chainDefinition: ChainDefinition,
  factoryAddress: string,
  values: TokenSimpleControlSubmitValues,
  walletProvider: EIP1193Provider,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenSimpleControlSubmitResult> {
  if (!walletProvider) {
    throw new Error('tokenSimpleControlCreation.errors.walletUnavailable')
  }

  if (!factoryAddress) {
    throw new Error('tokenSimpleControlCreation.errors.factoryUnavailable')
  }

  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const contract = new Contract(factoryAddress, simpleControlTokenFactoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const walletBalance = await browserProvider.getBalance(signerAddress)

  if (walletBalance < creationFee) {
    throw new Error('tokenSimpleControlCreation.errors.insufficientBalance')
  }

  const totalSupply = parseUnits(values.totalSupply.trim(), values.decimals)
  const initialMaxWalletAmount = values.enableWalletLimit
    ? parseUnits(values.maxWalletAmount.trim(), values.decimals)
    : 0n
  const receiveAddress = values.receiveAddress.trim() || signerAddress

  const createParams = {
    name: values.name.trim(),
    symbol: values.symbol.trim(),
    decimals: values.decimals,
    totalSupply,
    owner: signerAddress,
    receiveAddress,
    enableMint: values.enableMint,
    enablePause: values.enablePause,
    blacklistEnabled: values.blacklistEnabled,
    whitelistEnabled: true,
    enableWalletLimit: values.enableWalletLimit,
    initialMaxWalletAmount,
    initialWhitelist: [] as string[],
    initialBlacklist: [] as string[],
  }

  let gasEstimate: bigint
  try {
    gasEstimate = (await contract.createToken.estimateGas(createParams, {
      value: creationFee,
    })) as bigint
  } catch (error) {
    if (isInsufficientFundsError(error)) {
      throw new Error('tokenSimpleControlCreation.errors.insufficientBalance')
    }
    throw mapSimpleControlContractError(error)
  }

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const estimatedMaxCost = estimateMaxTransactionCost(gasOverrides)

  if (walletBalance < estimatedMaxCost) {
    throw new Error('tokenSimpleControlCreation.errors.insufficientBalance')
  }

  try {
    const transaction = await contract.createToken(createParams, gasOverrides)

    options?.onPending?.()
    const receipt = await transaction.wait()

    let tokenAddress: string | undefined
    for (const log of receipt?.logs ?? []) {
      try {
        const parsed = factoryInterface.parseLog(log)
        if (parsed?.name === 'TokenCreated') {
          tokenAddress = parsed.args.token as string
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
    }
  } catch (error) {
    if (isInsufficientFundsError(error)) {
      throw new Error('tokenSimpleControlCreation.errors.insufficientBalance')
    }
    throw mapSimpleControlContractError(error)
  }
}

function mapSimpleControlContractError(error: unknown) {
  const errorName = parseContractErrorName(error)
  const errorKeyByName: Record<string, string> = {
    EmptyName: 'tokenSimpleControlCreation.errors.nameRequired',
    EmptySymbol: 'tokenSimpleControlCreation.errors.symbolRequired',
    InvalidDecimals: 'tokenSimpleControlCreation.errors.decimalsInvalid',
    InvalidTotalSupply: 'tokenSimpleControlCreation.errors.supplyInvalid',
    InvalidMaxWalletAmount: 'tokenSimpleControlCreation.errors.maxWalletAmountInvalid',
    ZeroAddress: 'tokenSimpleControlCreation.errors.receiveAddressInvalid',
    FactoryInsufficientFee: 'tokenSimpleControlCreation.errors.insufficientFactoryFee',
    FactoryFeeTransferFailed: 'tokenSimpleControlCreation.errors.factoryFeeTransferFailed',
    FactoryRefundFailed: 'tokenSimpleControlCreation.errors.factoryRefundFailed',
  }

  if (errorName && errorKeyByName[errorName]) {
    return new Error(errorKeyByName[errorName])
  }

  return error instanceof Error ? error : new Error('tokenSimpleControlCreation.errors.creationFailed')
}

function parseContractErrorName(error: unknown) {
  const data = findErrorData(error)
  if (!data) {
    return ''
  }

  for (const item of [factoryInterface, tokenInterface]) {
    try {
      return item.parseError(data)?.name ?? ''
    } catch {
      continue
    }
  }

  return ''
}

function findErrorData(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return ''
  }

  const record = error as Record<string, unknown>
  for (const key of ['data', 'error', 'info']) {
    const value = record[key]
    if (typeof value === 'string' && value.startsWith('0x')) {
      return value
    }
    const nested = findErrorData(value)
    if (nested) {
      return nested
    }
  }

  return ''
}
