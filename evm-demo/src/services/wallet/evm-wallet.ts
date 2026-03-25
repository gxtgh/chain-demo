import type { ChainConfig } from '../../config/chains'

type EthereumProvider = {
  request: (payload: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export function hasInjectedWallet() {
  return Boolean(window.ethereum)
}

export async function requestWalletAccount() {
  const result = (await window.ethereum?.request({
    method: 'eth_requestAccounts',
  })) as string[] | undefined

  return result?.[0] ?? ''
}

export async function getInjectedAccount() {
  const accounts = (await window.ethereum?.request({
    method: 'eth_accounts',
  })) as string[] | undefined

  const chainHex = (await window.ethereum?.request({
    method: 'eth_chainId',
  })) as string | undefined

  return {
    account: accounts?.[0] ?? null,
    chainId: chainHex ? Number.parseInt(chainHex, 16) : null,
  }
}

export async function addOrSwitchChain(chainConfig: ChainConfig) {
  const chainIdHex = `0x${chainConfig.chainId.toString(16)}`

  try {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch {
    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainIdHex,
          chainName: chainConfig.name,
          rpcUrls: chainConfig.rpcUrls,
          blockExplorerUrls: chainConfig.blockExplorerUrls,
          nativeCurrency: chainConfig.nativeCurrency,
        },
      ],
    })
  }
}

export function shortAddress(value: string) {
  return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value
}
