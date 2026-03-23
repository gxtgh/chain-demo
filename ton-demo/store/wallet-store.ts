import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { TonWalletRecord } from "../types/wallet";

interface WalletStoreState {
  wallets: TonWalletRecord[];
  selectedWalletIds: string[];
  addWallets: (wallets: TonWalletRecord[]) => void;
  removeWallet: (walletId: string) => void;
  clearWallets: () => void;
  toggleWallet: (walletId: string) => void;
  toggleAllWallets: () => void;
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set, get) => ({
      wallets: [],
      selectedWalletIds: [],
      addWallets: (wallets) => {
        const existingMap = new Map(get().wallets.map((item) => [item.rawAddress, item]));

        for (const wallet of wallets) {
          existingMap.set(wallet.rawAddress, wallet);
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
        })
    }),
    {
      name: "ton-demo-wallets",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
