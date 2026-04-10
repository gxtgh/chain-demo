import { BrowserProvider, Contract, Interface, JsonRpcProvider, ZeroAddress } from 'ethers'
import type { EIP1193Provider } from 'viem'
import { getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import { estimateMaxTransactionCost, getDynamicGasOverrides } from '@/utils/evm-gas'
import { isInsufficientFundsError } from '@/utils/evm-submit-error'
import tokenTaxFactoryAbi from '@/assets/abi/TokenTax.json'
import tokenTaxShadowFactoryAbi from '@/assets/abi/TokenTaxShadow.json'
import type { TokenTaxSubmitResult, TokenTaxSubmitValues } from './model'

export async function readTaxCreationFee(chainDefinition: ChainDefinition, factoryAddress: string) {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !factoryAddress) {
    throw new Error('tokenTaxCreation.errors.factoryUnavailable')
  }

  const { abi } = resolveTaxFactoryContext(chainDefinition, factoryAddress)
  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(factoryAddress, abi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenTaxCreation(
  chainDefinition: ChainDefinition,
  factoryAddress: string,
  values: TokenTaxSubmitValues,
  walletProvider: EIP1193Provider,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenTaxSubmitResult> {
  if (!walletProvider) {
    throw new Error('tokenTaxCreation.errors.walletUnavailable')
  }

  if (!factoryAddress) {
    throw new Error('tokenTaxCreation.errors.factoryUnavailable')
  }

  const { abi, isShadowFactory } = resolveTaxFactoryContext(chainDefinition, factoryAddress)
  const factoryInterface = new Interface(abi)
  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const contract = new Contract(factoryAddress, abi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const walletBalance = await browserProvider.getBalance(signerAddress)

  if (walletBalance < creationFee) {
    throw new Error('tokenTaxCreation.errors.insufficientBalance')
  }

  const tokenParams = {
    name: values.name,
    symbol: values.symbol,
    decimals: values.decimals,
    totalSupply: BigInt(values.totalSupply),
    buyTax: toBasisPoints(values.buyTax),
    sellTax: toBasisPoints(values.sellTax),
    taxReceiver: values.taxFeeReceiveAddress.trim() || signerAddress,
    pairedToken: values.poolToken || ZeroAddress,
    tradingEnabled: true,
    renounceOwnership: false,
  }
  const submitParams = isShadowFactory
    ? {
        ...tokenParams,
        stablePair: false,
      }
    : tokenParams

  let gasEstimate: bigint
  try {
    gasEstimate = (await contract.createTaxToken.estimateGas(submitParams, {
      value: creationFee,
    })) as bigint
  } catch (error) {
    if (isInsufficientFundsError(error)) {
      throw new Error('tokenTaxCreation.errors.insufficientBalance')
    }
    throw error
  }

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const estimatedMaxCost = estimateMaxTransactionCost(gasOverrides)

  if (walletBalance < estimatedMaxCost) {
    throw new Error('tokenTaxCreation.errors.insufficientBalance')
  }

  const transaction = await contract.createTaxToken(submitParams, gasOverrides)

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
    taxReceiverAddress: tokenParams.taxReceiver,
  }
}

function toBasisPoints(value: string) {
  if (!value.trim()) {
    return 0n
  }

  return BigInt(Math.round(Number(value) * 100))
}

function resolveTaxFactoryContext(chainDefinition: ChainDefinition, factoryAddress: string) {
  const factoryConfig = chainDefinition.contractList.find(
    (contract) => contract.key === 'tokenTaxFactory' && contract.address.toLowerCase() === factoryAddress.toLowerCase(),
  )
  const isShadowFactory = factoryConfig?.dex === 'Shadow'

  return {
    abi: isShadowFactory ? tokenTaxShadowFactoryAbi : tokenTaxFactoryAbi,
    isShadowFactory,
  }
}
