import { useMemo } from "react";

import { createTonClient } from "../lib/ton/client";
import { useNetworkStore } from "../store/network-store";

export function useTonClient() {
  const network = useNetworkStore((state) => state.network);

  return useMemo(() => createTonClient(network), [network]);
}
