import type { BrowserProvider } from 'ethers'
import type { ChainDefinition } from '@/config/chains'

type GasOverrides = Record<string, bigint>

export async function getDynamicGasOverrides(
  provider: BrowserProvider,
  chainDefinition: ChainDefinition,
  gasLimit: bigint,
  value?: bigint,
) {
  const feeData = await provider.getFeeData()
  const overrides: GasOverrides = { gasLimit }

  if (typeof value === 'bigint') {
    overrides.value = value
  }

  if (!chainDefinition.EIP1559) {
    if (feeData.gasPrice) {
      overrides.gasPrice = feeData.gasPrice
    }
    return overrides
  }

  if (feeData.maxFeePerGas) {
    overrides.maxFeePerGas = feeData.maxFeePerGas
  }

  if (feeData.maxPriorityFeePerGas) {
    overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
  }

  if (!feeData.maxFeePerGas && feeData.gasPrice) {
    overrides.gasPrice = feeData.gasPrice
  }

  return overrides
}

export function estimateMaxTransactionCost(gasOverrides: Partial<GasOverrides>) {
  const creationFee = gasOverrides.value ?? 0n
  const gasLimit = gasOverrides.gasLimit ?? 0n

  if (gasOverrides.maxFeePerGas) {
    return creationFee + gasLimit * gasOverrides.maxFeePerGas
  }

  if (gasOverrides.gasPrice) {
    return creationFee + gasLimit * gasOverrides.gasPrice
  }

  return creationFee
}
