export interface RecoverableTokenAccount {
  tokenAccount: string;
  lamports: number;
}

export interface RentScanResult {
  ownerAddress: string;
  recoverableAccounts: RecoverableTokenAccount[];
  recoverableLamports: number;
  recoverableSol: number;
  skipped: boolean;
  notes: string[];
}

