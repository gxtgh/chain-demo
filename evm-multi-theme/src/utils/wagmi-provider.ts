import type { Connector } from 'wagmi'
import type { EIP1193Provider } from 'viem'

export async function getConnectorProvider(connector: Connector | undefined, chainId: number) {
  const provider = await connector?.getProvider({ chainId })
  return provider as EIP1193Provider | undefined
}
