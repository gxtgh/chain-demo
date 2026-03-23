import { useMemo } from "react";

import { createTronWeb } from "../lib/tron/client";
import { useNetworkStore } from "../store/network-store";

export function useTronClient() {
  const network = useNetworkStore((state) => state.network);
  return useMemo(() => createTronWeb(network), [network]);
}
