export type TransferAssetKind = "sol" | "spl";

export interface TransferAssetInput {
  kind: TransferAssetKind;
  mintAddress?: string;
}

export interface TransferRecipientInput {
  address: string;
  amount: string;
}

export interface ManyToManyTransferInput {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
}

export interface TransferExecutionResult {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  assetKind: TransferAssetKind;
  mintAddress?: string;
  decimals: number;
  status: "success" | "failed" | "skipped";
  signature?: string;
  skipped: boolean;
  notes: string[];
}

export interface RelayTransferInput {
  sourceAddress: string;
  relayAddress: string;
  destinationAddress: string;
  sourceToRelayAmount: string;
  relayToDestinationAmount: string;
  asset: TransferAssetInput;
}
