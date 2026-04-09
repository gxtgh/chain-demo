import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers'
import type { EIP1193Provider } from 'viem'
import { getChainContractAddress, getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import tokenFactoryAbi from '@/assets/abi/TokenFactory.json'
import { estimateMaxTransactionCost, getDynamicGasOverrides } from '@/utils/evm-gas'
import type { TokenCreationSubmitResult, TokenCreationSubmitValues } from './model'

const factoryInterface = new Interface(tokenFactoryAbi)

export async function readCreationFee(chainDefinition: ChainDefinition) {
  const rpcUrl = getChainRpcUrl(chainDefinition)
  const tokenFactoryAddress = getChainContractAddress(chainDefinition, 'tokenFactory')

  if (!rpcUrl || !tokenFactoryAddress) {
    throw new Error('tokenCreation.errors.factoryUnavailable')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(tokenFactoryAddress, tokenFactoryAbi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenCreation(
  chainDefinition: ChainDefinition,
  values: TokenCreationSubmitValues,
  walletProvider: EIP1193Provider,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenCreationSubmitResult> {
  if (!walletProvider) {
    throw new Error('tokenCreation.errors.walletUnavailable')
  }

  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const tokenFactoryAddress = getChainContractAddress(chainDefinition, 'tokenFactory')

  if (!tokenFactoryAddress) {
    throw new Error('tokenCreation.errors.factoryUnavailable')
  }

  const contract = new Contract(tokenFactoryAddress, tokenFactoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const totalSupply = BigInt(values.totalSupply)
  const walletBalance = await browserProvider.getBalance(signerAddress)

  const gasEstimate = (await contract.createToken.estimateGas(
    values.name,
    values.symbol,
    values.decimals,
    totalSupply,
    { value: creationFee },
  )) as bigint

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const estimatedMaxCost = estimateMaxTransactionCost(gasOverrides)

  if (walletBalance < estimatedMaxCost) {
    throw new Error('tokenCreation.errors.insufficientBalance')
  }

  const transaction = await contract.createToken(values.name, values.symbol, values.decimals, totalSupply, gasOverrides)

  options?.onPending?.()
  const receipt = await transaction.wait()

  let tokenAddress: string | undefined
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = factoryInterface.parseLog(log)
      if (parsed?.name === 'TokenCreated') {
        tokenAddress = parsed.args.tokenAddress as string
        break
      }
    } catch {
      continue
    }
  }

  return {
    txHash: transaction.hash,
    tokenAddress,
  }
}
