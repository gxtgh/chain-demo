import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers'
import type { ChainDefinition } from '@/config/chains'
import { factoryAbi } from './factoryAbi'
import type { TokenCreationFormValues, TokenCreationSubmitResult } from './types'

const factoryInterface = new Interface(factoryAbi)

export async function readCreationFee(chainDefinition: ChainDefinition) {
  const provider = new JsonRpcProvider(chainDefinition.rpcUrl)
  const contract = new Contract(chainDefinition.factoryAddress, factoryAbi, provider)
  return (await contract.creationFee()) as bigint
}

export async function submitTokenCreation(
  chainDefinition: ChainDefinition,
  values: TokenCreationFormValues,
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
  const contract = new Contract(chainDefinition.factoryAddress, factoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const totalSupply = BigInt(values.totalSupply)

  options?.onWaitingWallet?.()
  const gasEstimate = (await contract.createToken.estimateGas(
    values.name,
    values.symbol,
    values.decimals,
    totalSupply,
    { value: creationFee },
  )) as bigint

  const gasLimit = (gasEstimate * 12n) / 10n
  const transaction = await contract.createToken(values.name, values.symbol, values.decimals, totalSupply, {
    value: creationFee,
    gasLimit,
  })

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
    explorerUrl: `${chainDefinition.explorerBaseUrl}/tx/${transaction.hash}`,
  }
}
