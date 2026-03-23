export type ApprovalActionKind =
  | "delegate-approve"
  | "delegate-revoke"
  | "set-authority"
  | "nft-update-authority"
  | "nft-approve-collection-authority"
  | "nft-revoke-collection-authority"
  | "nft-delegate-standard"
  | "nft-revoke-standard";

export type StandardAuthorityKind =
  | "mint-tokens"
  | "freeze-account"
  | "account-owner"
  | "close-account";

export type Token2022AuthorityKind =
  | "transfer-fee-config"
  | "withheld-withdraw"
  | "close-mint"
  | "interest-rate"
  | "permanent-delegate"
  | "transfer-hook-program-id"
  | "metadata-pointer"
  | "group-pointer"
  | "group-member-pointer"
  | "scaled-ui-amount-config"
  | "pausable-config";

export type AuthorityKind = StandardAuthorityKind | Token2022AuthorityKind;

export type ApprovalCoverageCategory =
  | "spl-token-standard"
  | "token-2022"
  | "metaplex-nft"
  | "protocol-specific";

export interface TokenDelegateApprovalInput {
  ownerAddress: string;
  delegateAddress: string;
  mintAddress: string;
  amount: string;
}

export interface TokenDelegateRevokeInput {
  ownerAddress: string;
  mintAddress: string;
}

export interface SetAuthorityInput {
  authorityType: AuthorityKind;
  currentAuthorityAddress: string;
  targetAddress: string;
  newAuthorityAddress?: string;
  clearAuthority?: boolean;
  tokenProgram?: "spl-token" | "token-2022";
}

export interface ApprovalExecutionResult {
  action: ApprovalActionKind;
  ownerAddress: string;
  mintAddress?: string;
  collectionMintAddress?: string;
  tokenAccountAddress?: string;
  targetAddress?: string;
  authorityType?: AuthorityKind;
  delegateAddress?: string;
  amount?: string;
  decimals?: number;
  signature?: string;
  skipped: boolean;
  notes: string[];
}
