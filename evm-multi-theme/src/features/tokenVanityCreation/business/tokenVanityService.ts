import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers'
import type { EIP1193Provider } from 'viem'
import { getChainContractAddress, getChainRpcUrl, type ChainDefinition } from '@/config/chains'
import { estimateMaxTransactionCost, getDynamicGasOverrides } from '@/utils/evm-gas'
import type { TokenVanitySubmitResult, TokenVanitySubmitValues } from './model'

const vanityTokenFactoryAbi = [
  'function creationFee() view returns (uint256)',
  'function createVanityToken(string name_, string symbol_, uint8 decimals_, uint256 totalSupply_, bytes32 salt) payable returns (address tokenAddr)',
  'event TokenCreated(address token, address indexed owner, string name, string symbol, uint8 decimals, uint256 totalSupply)',
] as const

const vanityTokenFactoryReaderAbi = ['function getTokenCreationCode() view returns (bytes)'] as const
const vanityFactoryInterface = new Interface(vanityTokenFactoryAbi)

export async function readVanityFactorySnapshot(chainDefinition: ChainDefinition) {
  const rpcUrl = getChainRpcUrl(chainDefinition)
  const factoryAddress = getChainContractAddress(chainDefinition, 'tokenVanityFactory')

  if (!rpcUrl || !factoryAddress) {
    throw new Error('tokenVanityCreation.errors.factoryUnavailable')
  }

  const provider = new JsonRpcProvider(rpcUrl)
  const feeContract = new Contract(factoryAddress, vanityTokenFactoryAbi, provider)
  const codeContract = new Contract(factoryAddress, vanityTokenFactoryReaderAbi, provider)

  const [creationFee, tokenCreationCode] = await Promise.all([
    feeContract.creationFee() as Promise<bigint>,
    codeContract.getTokenCreationCode() as Promise<string>,
  ])

  if (!tokenCreationCode || tokenCreationCode === '0x') {
    throw new Error('tokenVanityCreation.errors.tokenCreationCodeUnavailable')
  }

  return {
    factoryAddress,
    creationFee,
    tokenCreationCode,
  }
}

export async function submitTokenVanityCreation(
  chainDefinition: ChainDefinition,
  values: TokenVanitySubmitValues,
  walletProvider: EIP1193Provider,
  options?: {
    onWaitingWallet?: () => void
    onPending?: () => void
  },
): Promise<TokenVanitySubmitResult> {
  if (!walletProvider) {
    throw new Error('tokenVanityCreation.errors.walletUnavailable')
  }

  const factoryAddress = getChainContractAddress(chainDefinition, 'tokenVanityFactory')
  if (!factoryAddress) {
    throw new Error('tokenVanityCreation.errors.factoryUnavailable')
  }

  const browserProvider = new BrowserProvider(walletProvider)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const contract = new Contract(factoryAddress, vanityTokenFactoryAbi, signer)
  const creationFee = (await contract.creationFee()) as bigint
  const totalSupply = BigInt(values.totalSupply)
  const walletBalance = await browserProvider.getBalance(signerAddress)

  const gasEstimate = (await contract.createVanityToken.estimateGas(
    values.name,
    values.symbol,
    values.decimals,
    totalSupply,
    values.salt,
    { value: creationFee },
  )) as bigint

  const gasLimit = (gasEstimate * 12n) / 10n
  options?.onWaitingWallet?.()
  const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee)
  const estimatedMaxCost = estimateMaxTransactionCost(gasOverrides)

  if (walletBalance < estimatedMaxCost) {
    throw new Error('tokenVanityCreation.errors.insufficientBalance')
  }

  const transaction = await contract.createVanityToken(
    values.name,
    values.symbol,
    values.decimals,
    totalSupply,
    values.salt,
    gasOverrides,
  )

  options?.onPending?.()
  const receipt = await transaction.wait()

  let tokenAddress: string | undefined
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = vanityFactoryInterface.parseLog(log)
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
    predictedAddress: values.predictedAddress,
    salt: values.salt,
  }
}
