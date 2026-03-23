import type { TonNetwork } from "./network";

export interface TonTransferRecipientInput {
  address: string;
  amount: string;
  memo?: string;
}

export interface ManyToOneTransferInput {
  sourceAddress: string;
  amount: string;
  memo?: string;
}

export interface ManyToManyTransferInput {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  memo?: string;
}

export interface RelayTransferInput {
  sourceAddress: string;
  relayAddress: string;
  destinationAddress: string;
  sourceToRelayAmount: string;
  relayToDestinationAmount: string;
  sourceMemo?: string;
  relayMemo?: string;
}

export interface TonTransferReceipt {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  memo?: string;
  seqno: number;
  confirmedSeqno: number;
  sourceExplorerUrl: string;
  destinationExplorerUrl: string;
}

export interface TonTransferBatchResult {
  mode: "one-to-many" | "many-to-one" | "many-to-many" | "relay";
  network: TonNetwork;
  total: number;
  successCount: number;
  items: TonTransferReceipt[];
}
