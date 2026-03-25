import type { Transaction } from "@mysten/sui/transactions";

export type WalletTransactionExecutor = (tx: Transaction) => Promise<{ digest: string }>;

export function createWalletExecutor(signAndExecute: any): WalletTransactionExecutor {
  return async (tx: Transaction) => {
    const result = await signAndExecute({
      transaction: tx
    } as any);

    return {
      digest: result.digest
    };
  };
}
