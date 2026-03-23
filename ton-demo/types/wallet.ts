import type { TonNetwork } from "./network";

export interface TonWalletRecord {
  id: string;
  label: string;
  address: string;
  rawAddress: string;
  publicKey: string;
  mnemonic: string[];
  createdAt: string;
  network: TonNetwork;
  version: "v4R2";
}

export interface WalletBalanceSnapshot {
  address: string;
  balanceNano: string;
  balanceTon: string;
}
