import type { TronNetwork } from "./network";

export type TransferAssetKind = "trx" | "trc20";

export interface TransferAssetInput {
  kind: TransferAssetKind;
  contractAddress?: string;
}

export interface TransferRecipientInput {
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

export interface TronTransferReceipt {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  memo?: string;
  assetKind: TransferAssetKind;
  contractAddress?: string;
  txId: string;
  sourceExplorerUrl: string;
  destinationExplorerUrl: string;
  transactionExplorerUrl: string;
}

export interface TronTransferBatchResult {
  mode: "one-to-many" | "many-to-one" | "many-to-many" | "relay";
  network: TronNetwork;
  total: number;
  successCount: number;
  asset: TransferAssetInput;
  items: TronTransferReceipt[];
}
