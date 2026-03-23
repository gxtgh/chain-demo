import {
  approveChecked,
  AuthorityType,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  revoke,
  setAuthority,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { PublicKey, type Connection, type Keypair } from "@solana/web3.js";

import { DEFAULT_RETRY_TIMES } from "../solana/constants";
import { withRetry } from "../utils/async-task";
import { restoreKeypairFromSecret } from "../wallet/keypair-storage";
import type { BatchTaskLog } from "../../types/task";
import type {
  AuthorityKind,
  ApprovalExecutionResult,
  SetAuthorityInput,
  TokenDelegateApprovalInput,
  TokenDelegateRevokeInput
} from "../../types/approval";
import type { LocalWalletRecord } from "../../types/wallet";

const AUTHORITY_LABELS: Record<AuthorityKind, string> = {
  "mint-tokens": "Mint Authority",
  "freeze-account": "Freeze Authority",
  "account-owner": "Account Owner",
  "close-account": "Close Authority",
  "transfer-fee-config": "Transfer Fee Config Authority",
  "withheld-withdraw": "Withheld Withdraw Authority",
  "close-mint": "Mint Close Authority",
  "interest-rate": "Interest Rate Authority",
  "permanent-delegate": "Permanent Delegate",
  "transfer-hook-program-id": "Transfer Hook Program Authority",
  "metadata-pointer": "Metadata Pointer Authority",
  "group-pointer": "Group Pointer Authority",
  "group-member-pointer": "Group Member Pointer Authority",
  "scaled-ui-amount-config": "Scaled UI Amount Config Authority",
  "pausable-config": "Pausable Config Authority"
};

export const approvalService = {
  async approveDelegate(
    connection: Connection,
    ownerWallet: LocalWalletRecord,
    input: TokenDelegateApprovalInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () => approveTokenDelegate(connection, ownerWallet, input, onLog),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async revokeDelegate(
    connection: Connection,
    ownerWallet: LocalWalletRecord,
    input: TokenDelegateRevokeInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () => revokeTokenDelegate(connection, ownerWallet, input, onLog),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async setAuthority(
    connection: Connection,
    currentAuthorityWallet: LocalWalletRecord,
    input: SetAuthorityInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () => executeSetAuthority(connection, currentAuthorityWallet, input, onLog),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  }
};

async function approveTokenDelegate(
  connection: Connection,
  ownerWallet: LocalWalletRecord,
  input: TokenDelegateApprovalInput,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const ownerKeypair = decodeWallet(ownerWallet);
  const ownerAddress = ownerKeypair.publicKey.toBase58();
  const mint = new PublicKey(input.mintAddress);
  const delegate = new PublicKey(input.delegateAddress);
  const tokenAccountAddress = getAssociatedTokenAddressSync(mint, ownerKeypair.publicKey);
  const mintInfo = await getMint(connection, mint);
  const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);

  if (!tokenAccountInfo) {
    throw new Error("Owner associated token account does not exist for this mint.");
  }

  const amountBaseUnits = toBaseUnits(input.amount, mintInfo.decimals);

  if (amountBaseUnits <= 0n) {
    throw new Error("Approval amount must be greater than 0.");
  }

  const signature = await approveChecked(
    connection,
    ownerKeypair,
    tokenAccountAddress,
    mint,
    delegate,
    ownerKeypair,
    amountBaseUnits,
    mintInfo.decimals
  );

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Approved delegate ${delegate.toBase58()} to spend ${input.amount} token(s) from ${ownerAddress}`
  });

  return {
    action: "delegate-approve",
    ownerAddress,
    mintAddress: mint.toBase58(),
    tokenAccountAddress: tokenAccountAddress.toBase58(),
    delegateAddress: delegate.toBase58(),
    amount: normalizeAmount(input.amount),
    decimals: mintInfo.decimals,
    signature,
    skipped: false,
    notes: []
  };
}

async function revokeTokenDelegate(
  connection: Connection,
  ownerWallet: LocalWalletRecord,
  input: TokenDelegateRevokeInput,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const ownerKeypair = decodeWallet(ownerWallet);
  const ownerAddress = ownerKeypair.publicKey.toBase58();
  const mint = new PublicKey(input.mintAddress);
  const tokenAccountAddress = getAssociatedTokenAddressSync(mint, ownerKeypair.publicKey);
  const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);

  if (!tokenAccountInfo) {
    throw new Error("Owner associated token account does not exist for this mint.");
  }

  const tokenAccount = await getAccount(connection, tokenAccountAddress);

  if (!tokenAccount.delegate) {
    return {
      action: "delegate-revoke",
      ownerAddress,
      mintAddress: mint.toBase58(),
      tokenAccountAddress: tokenAccountAddress.toBase58(),
      skipped: true,
      notes: ["Current token account has no delegate to revoke."]
    };
  }

  const mintInfo = await getMint(connection, mint);
  const signature = await revoke(connection, ownerKeypair, tokenAccountAddress, ownerKeypair);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Revoked delegate ${tokenAccount.delegate.toBase58()} from ${ownerAddress}`
  });

  return {
    action: "delegate-revoke",
    ownerAddress,
    mintAddress: mint.toBase58(),
    tokenAccountAddress: tokenAccountAddress.toBase58(),
    delegateAddress: tokenAccount.delegate.toBase58(),
    decimals: mintInfo.decimals,
    signature,
    skipped: false,
    notes: []
  };
}

async function executeSetAuthority(
  connection: Connection,
  currentAuthorityWallet: LocalWalletRecord,
  input: SetAuthorityInput,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const currentAuthorityKeypair = decodeWallet(currentAuthorityWallet);
  const target = new PublicKey(input.targetAddress);
  const newAuthority = input.clearAuthority
    ? null
    : input.newAuthorityAddress?.trim()
      ? new PublicKey(input.newAuthorityAddress.trim())
      : null;

  if (!input.clearAuthority && !newAuthority) {
    throw new Error("New authority address is required unless you are clearing the authority.");
  }

  const signature = await setAuthority(
    connection,
    currentAuthorityKeypair,
    target,
    currentAuthorityKeypair,
    mapAuthorityType(input.authorityType),
    newAuthority,
    [],
    undefined,
    input.tokenProgram === "token-2022" ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
  );

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `${input.clearAuthority ? "Cleared" : "Updated"} ${AUTHORITY_LABELS[input.authorityType]} on ${input.targetAddress}`
  });

  return {
    action: "set-authority",
    ownerAddress: currentAuthorityKeypair.publicKey.toBase58(),
    targetAddress: input.targetAddress,
    authorityType: input.authorityType,
    signature,
    skipped: false,
    notes: input.clearAuthority
      ? ["Authority was cleared and set to null."]
      : [`New authority: ${newAuthority?.toBase58()}`]
  };
}

function mapAuthorityType(authorityType: AuthorityKind): AuthorityType {
  switch (authorityType) {
    case "mint-tokens":
      return AuthorityType.MintTokens;
    case "freeze-account":
      return AuthorityType.FreezeAccount;
    case "account-owner":
      return AuthorityType.AccountOwner;
    case "close-account":
      return AuthorityType.CloseAccount;
    case "transfer-fee-config":
      return AuthorityType.TransferFeeConfig;
    case "withheld-withdraw":
      return AuthorityType.WithheldWithdraw;
    case "close-mint":
      return AuthorityType.CloseMint;
    case "interest-rate":
      return AuthorityType.InterestRate;
    case "permanent-delegate":
      return AuthorityType.PermanentDelegate;
    case "transfer-hook-program-id":
      return AuthorityType.TransferHookProgramId;
    case "metadata-pointer":
      return AuthorityType.MetadataPointer;
    case "group-pointer":
      return AuthorityType.GroupPointer;
    case "group-member-pointer":
      return AuthorityType.GroupMemberPointer;
    case "scaled-ui-amount-config":
      return AuthorityType.ScaledUiAmountConfig;
    case "pausable-config":
      return AuthorityType.PausableConfig;
  }
}

function decodeWallet(wallet: LocalWalletRecord): Keypair {
  return restoreKeypairFromSecret(
    wallet.encryptedSecretKey.startsWith("demo:") ? wallet.encryptedSecretKey : wallet.secretKeyBase58,
    import.meta.env.VITE_DEMO_SECRET_PASSPHRASE ?? "local-demo-only"
  );
}

function toBaseUnits(amount: string, decimals: number): bigint {
  const normalized = normalizeAmount(amount);

  if (!/^(\d+)(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");

  if (fractionPart.length > decimals) {
    throw new Error(`Amount ${amount} exceeds supported decimal places (${decimals}).`);
  }

  return BigInt(
    `${wholePart}${fractionPart.padEnd(decimals, "0")}`.replace(/^0+(?=\d)/, "") || "0"
  );
}

function normalizeAmount(amount: string): string {
  return amount.trim();
}
