import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { LocalWalletRecord } from "../types/wallet";

interface WalletStoreState {
  wallets: LocalWalletRecord[];
  selectedWalletIds: string[];
  setWallets: (wallets: LocalWalletRecord[]) => void;
  addWallets: (wallets: LocalWalletRecord[]) => void;
  removeWallet: (walletId: string) => void;
  clearWallets: () => void;
  toggleWallet: (walletId: string) => void;
  toggleAllWallets: () => void;
  setSelectedWalletIds: (walletIds: string[]) => void;
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set, get) => ({
      wallets: [],
      selectedWalletIds: [],
      setWallets: (wallets) =>
        set({
          wallets,
          selectedWalletIds: wallets.map((item) => item.id)
        }),
      addWallets: (wallets) => {
        const existingMap = new Map(get().wallets.map((item) => [item.publicKey, item]));

        for (const wallet of wallets) {
          existingMap.set(wallet.publicKey, wallet);
        }

        const nextWallets = Array.from(existingMap.values());
        set({
          wallets: nextWallets,
          selectedWalletIds: Array.from(
            new Set([...get().selectedWalletIds, ...wallets.map((item) => item.id)])
          )
        });
      },
      removeWallet: (walletId) =>
        set({
          wallets: get().wallets.filter((item) => item.id !== walletId),
          selectedWalletIds: get().selectedWalletIds.filter((item) => item !== walletId)
        }),
      clearWallets: () =>
        set({
          wallets: [],
          selectedWalletIds: []
        }),
      toggleWallet: (walletId) =>
        set({
          selectedWalletIds: get().selectedWalletIds.includes(walletId)
            ? get().selectedWalletIds.filter((item) => item !== walletId)
            : [...get().selectedWalletIds, walletId]
        }),
      toggleAllWallets: () =>
        set({
          selectedWalletIds:
            get().selectedWalletIds.length === get().wallets.length
              ? []
              : get().wallets.map((item) => item.id)
        }),
      setSelectedWalletIds: (walletIds) => set({ selectedWalletIds: walletIds })
    }),
    {
      name: "solana-demo-wallets",
      // Wallets stay entirely in the browser for this demo project.
      storage: createJSONStorage(() => localStorage)
    }
  )
);
