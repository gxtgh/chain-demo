import type { TronNetwork } from "./network";

export interface TronWalletRecord {
  id: string;
  label: string;
  addressBase58: string;
  addressHex: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
  network: TronNetwork;
}
