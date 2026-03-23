import type { TronNetwork } from "./network";

export interface EnergyActionReceipt {
  action: "freeze" | "delegate" | "undelegate" | "unfreeze";
  network: TronNetwork;
  ownerAddress: string;
  receiverAddress?: string;
  amountTrx: string;
  txId: string;
  explorerUrl: string;
}
