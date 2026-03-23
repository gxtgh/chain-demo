import { create } from "zustand";

import { defaultCluster } from "../lib/solana/rpc-config";

interface NetworkStoreState {
  cluster: string;
  setCluster: (cluster: string) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  cluster: defaultCluster,
  setCluster: (cluster) => set({ cluster })
}));

