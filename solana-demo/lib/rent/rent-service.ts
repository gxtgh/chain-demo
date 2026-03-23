import type { Connection } from "@solana/web3.js";

import { recoverRentForWallets, scanRecoverableRentForWallets } from "../wallet/wallet-service";
import type { LocalWalletRecord } from "../../types/wallet";
import type { BatchTaskLog } from "../../types/task";

export const rentService = {
  async scanForWallets(
    connection: Connection,
    wallets: LocalWalletRecord[],
    onLog?: (log: BatchTaskLog) => void
  ) {
    return scanRecoverableRentForWallets(connection, wallets, { onLog });
  },

  async recoverForWallets(
    connection: Connection,
    wallets: LocalWalletRecord[],
    onLog?: (log: BatchTaskLog) => void
  ) {
    return recoverRentForWallets(connection, wallets, { onLog });
  }
};
