import { TronWeb } from "tronweb";

import { tronNetworks } from "./constants";
import type { TronNetwork } from "../../types/network";

export function createTronWeb(network: TronNetwork, privateKey?: string) {
  const networkConfig = tronNetworks.find((item) => item.id === network);

  if (!networkConfig) {
    throw new Error(`Unsupported Tron network: ${network}`);
  }

  return new TronWeb({
    fullHost: networkConfig.fullHost,
    privateKey
  });
}

export function getExplorerAddressUrl(network: TronNetwork, address: string) {
  const networkConfig = tronNetworks.find((item) => item.id === network);
  return `${networkConfig?.explorerBaseUrl}/address/${address}`;
}

export function getExplorerTransactionUrl(network: TronNetwork, txId: string) {
  const networkConfig = tronNetworks.find((item) => item.id === network);
  return `${networkConfig?.explorerBaseUrl}/transaction/${txId}`;
}
