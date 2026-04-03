import { BrowserProvider, Contract, Interface, JsonRpcProvider, ZeroAddress } from 'ethers'
import { getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import { getDynamicGasOverrides } from '@/utils/evm-gas'
import tokenTaxFactoryAbi from '@/assets/abi/TokenTax.json'
import type { TokenTaxSubmitResult, TokenTaxSubmitValues } from './model'

const factoryInterface = new Interface(tokenTaxFactoryAbi)

export async function readTaxCreationFee(chainDefinition: ChainDefinition, factoryAddress: string) {
  const rpcUrl = getChainRpcUrl(chainDefinition)

  if (!rpcUrl || !factoryAddress) {
    throw new Error('tokenTaxCreation.errors.factoryUnavailable')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(factoryAddress, tokenTaxFactoryAbi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenTaxCreation(
  chainDefinition: ChainDefinition,
  factoryAddress: string,
  values: TokenTaxSubmitValues,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenTaxSubmitResult> {
  if (!window.ethereum) {
    throw new Error('tokenTaxCreation.errors.walletUnavailable')
  }

  if (!factoryAddress) {
    throw new Error('tokenTaxCreation.errors.factoryUnavailable')
  }

  const browserProvider = new BrowserProvider(window.ethereum as never)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const contract = new Contract(factoryAddress, tokenTaxFactoryAbi, signer)
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
    buyTax: toBasisPoints(values.isSetTax ? values.buyTax : ''),
    sellTax: toBasisPoints(values.isSetTax ? values.sellTax : ''),
    taxReceiver: values.taxFeeReceiveAddress.trim() || signerAddress,
    pairedToken: values.poolToken || ZeroAddress,
    tradingEnabled: true,
    renounceOwnership: false,
  }

  const gasEstimate = (await contract.createTaxToken.estimateGas(tokenParams, {
    value: creationFee,
  })) as bigint

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const transaction = await contract.createTaxToken(tokenParams, gasOverrides)

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
    txExplorerUrl: `${chainDefinition.explorerBaseUrl}/tx/${transaction.hash}`,
    tokenExplorerUrl: tokenAddress ? `${chainDefinition.explorerBaseUrl}/address/${tokenAddress}` : undefined,
    taxReceiverAddress: tokenParams.taxReceiver,
  }
}

function toBasisPoints(value: string) {
  if (!value.trim()) {
    return 0n
  }

  return BigInt(Math.round(Number(value) * 100))
}
