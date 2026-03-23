import { TonClient } from "@ton/ton";

import { tonNetworks } from "./constants";
import type { TonNetwork } from "../../types/network";

export function createTonClient(network: TonNetwork) {
  const networkConfig = tonNetworks.find((item) => item.id === network);

  if (!networkConfig) {
    throw new Error(`Unsupported TON network: ${network}`);
  }

  return new TonClient({
    endpoint: networkConfig.endpoint
  });
}
