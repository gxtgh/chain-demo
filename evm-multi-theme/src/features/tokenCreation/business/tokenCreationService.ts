import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers'
import { getChainContractAddress, getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import tokenFactoryAbi from '@/assets/abi/TokenFactory.json'
import { getDynamicGasOverrides } from '@/utils/evm-gas'
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
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenCreationSubmitResult> {
  if (!window.ethereum) {
    throw new Error('tokenCreation.errors.walletUnavailable')
  }

  const browserProvider = new BrowserProvider(window.ethereum as never)
  const signer = await browserProvider.getSigner()
  const tokenFactoryAddress = getChainContractAddress(chainDefinition, 'tokenFactory')

  if (!tokenFactoryAddress) {
    throw new Error('tokenCreation.errors.factoryUnavailable')
  }

  const contract = new Contract(tokenFactoryAddress, tokenFactoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const totalSupply = BigInt(values.totalSupply)

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
    txExplorerUrl: `${chainDefinition.explorerBaseUrl}/tx/${transaction.hash}`,
    tokenExplorerUrl: tokenAddress ? `${chainDefinition.explorerBaseUrl}/address/${tokenAddress}` : undefined,
  }
}
