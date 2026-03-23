export type WalletOrigin = "generated" | "imported" | "vanity";

export interface LocalWalletRecord {
  id: string;
  label: string;
  publicKey: string;
  secretKeyBase58: string;
  encryptedSecretKey: string;
  createdAt: string;
  origin: WalletOrigin;
}

export interface WalletTokenBalance {
  mint: string;
  tokenAccount: string;
  amountRaw: string;
  amountUi: number;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface WalletBalanceSnapshot {
  address: string;
  lamports: number;
  sol: number;
  tokens: WalletTokenBalance[];
}

export interface VanitySearchInput {
  prefix?: string;
  suffix?: string;
  limit: number;
  maxAttempts: number;
}

export interface VanitySearchMatch {
  wallet: LocalWalletRecord;
  attempts: number;
}

export interface TokenMigrationResult {
  mint: string;
  tokenAccount: string;
  amountRaw: string;
  amountUi: number;
  signature: string;
}

export interface WalletMigrationResult {
  sourceAddress: string;
  solTransferredLamports: number;
  solTransferred: number;
  solSignature?: string;
  tokenTransfers: TokenMigrationResult[];
  skipped: boolean;
  notes: string[];
}

export interface RentRecoveryResult {
  ownerAddress: string;
  closedAccounts: string[];
  signatures: string[];
  recoveredLamports: number;
  skipped: boolean;
  notes: string[];
}

