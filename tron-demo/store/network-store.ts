import { create } from "zustand";

import { defaultNetwork } from "../lib/tron/constants";
import type { TronNetwork } from "../types/network";

interface NetworkStoreState {
  network: TronNetwork;
  setNetwork: (network: TronNetwork) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  network: defaultNetwork,
  setNetwork: (network) => set({ network })
}));
