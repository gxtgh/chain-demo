import { create } from "zustand";

import { defaultNetwork } from "../lib/ton/constants";
import type { TonNetwork } from "../types/network";

interface NetworkStoreState {
  network: TonNetwork;
  setNetwork: (network: TonNetwork) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  network: defaultNetwork,
  setNetwork: (network) => set({ network })
}));
