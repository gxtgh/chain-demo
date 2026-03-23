import bs58 from "bs58";
import {
  approveCollectionAuthority,
  delegateStandardV1,
  findCollectionAuthorityRecordPda,
  mplTokenMetadata,
  revokeCollectionAuthority,
  revokeStandardV1,
  TokenStandard,
  updateV1
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { PublicKey, type Connection, type Keypair } from "@solana/web3.js";

import { DEFAULT_RETRY_TIMES } from "../solana/constants";
import { withRetry } from "../utils/async-task";
import { restoreKeypairFromSecret } from "../wallet/keypair-storage";
import type { ApprovalExecutionResult } from "../../types/approval";
import type { BatchTaskLog } from "../../types/task";
import type { LocalWalletRecord } from "../../types/wallet";

export const nftApprovalService = {
  async updateAuthority(
    connection: Connection,
    authorityWallet: LocalWalletRecord,
    mintAddress: string,
    newAuthorityAddress: string,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () => executeUpdateAuthority(connection, authorityWallet, mintAddress, newAuthorityAddress, onLog),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async approveCollectionAuthority(
    connection: Connection,
    updateAuthorityWallet: LocalWalletRecord,
    collectionMintAddress: string,
    delegateAddress: string,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () =>
        executeApproveCollectionAuthority(
          connection,
          updateAuthorityWallet,
          collectionMintAddress,
          delegateAddress,
          onLog
        ),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async revokeCollectionAuthority(
    connection: Connection,
    revokeAuthorityWallet: LocalWalletRecord,
    collectionMintAddress: string,
    delegateAddress: string,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () =>
        executeRevokeCollectionAuthority(
          connection,
          revokeAuthorityWallet,
          collectionMintAddress,
          delegateAddress,
          onLog
        ),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async delegateStandard(
    connection: Connection,
    authorityWallet: LocalWalletRecord,
    mintAddress: string,
    delegateAddress: string,
    tokenStandard: TokenStandard,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () =>
        executeDelegateStandard(
          connection,
          authorityWallet,
          mintAddress,
          delegateAddress,
          tokenStandard,
          onLog
        ),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  },

  async revokeStandard(
    connection: Connection,
    authorityWallet: LocalWalletRecord,
    mintAddress: string,
    delegateAddress: string,
    tokenStandard: TokenStandard,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<ApprovalExecutionResult> {
    return withRetry(
      () =>
        executeRevokeStandard(
          connection,
          authorityWallet,
          mintAddress,
          delegateAddress,
          tokenStandard,
          onLog
        ),
      DEFAULT_RETRY_TIMES,
      onLog
    );
  }
};

async function executeUpdateAuthority(
  connection: Connection,
  authorityWallet: LocalWalletRecord,
  mintAddress: string,
  newAuthorityAddress: string,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const authorityKeypair = decodeWallet(authorityWallet);
  const umi = createMetaplexUmi(connection, authorityKeypair);
  const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
  const newAuthority = fromWeb3JsPublicKey(new PublicKey(newAuthorityAddress));
  const response = await updateV1(umi, {
    mint,
    newUpdateAuthority: newAuthority
  }).sendAndConfirm(umi);
  const signature = bs58.encode(response.signature);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Updated NFT update authority for ${mintAddress} to ${newAuthorityAddress}`
  });

  return {
    action: "nft-update-authority",
    ownerAddress: authorityKeypair.publicKey.toBase58(),
    mintAddress,
    targetAddress: newAuthorityAddress,
    signature,
    skipped: false,
    notes: []
  };
}

async function executeApproveCollectionAuthority(
  connection: Connection,
  updateAuthorityWallet: LocalWalletRecord,
  collectionMintAddress: string,
  delegateAddress: string,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const updateAuthorityKeypair = decodeWallet(updateAuthorityWallet);
  const umi = createMetaplexUmi(connection, updateAuthorityKeypair);
  const mint = fromWeb3JsPublicKey(new PublicKey(collectionMintAddress));
  const delegate = fromWeb3JsPublicKey(new PublicKey(delegateAddress));
  const collectionAuthorityRecord = findCollectionAuthorityRecordPda(umi, {
    mint,
    collectionAuthority: delegate
  });
  const response = await approveCollectionAuthority(umi, {
    collectionAuthorityRecord,
    newCollectionAuthority: delegate,
    mint
  }).sendAndConfirm(umi);
  const signature = bs58.encode(response.signature);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Approved collection authority ${delegateAddress} for collection mint ${collectionMintAddress}`
  });

  return {
    action: "nft-approve-collection-authority",
    ownerAddress: updateAuthorityKeypair.publicKey.toBase58(),
    mintAddress: collectionMintAddress,
    collectionMintAddress,
    delegateAddress,
    signature,
    skipped: false,
    notes: []
  };
}

async function executeRevokeCollectionAuthority(
  connection: Connection,
  revokeAuthorityWallet: LocalWalletRecord,
  collectionMintAddress: string,
  delegateAddress: string,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const revokeAuthorityKeypair = decodeWallet(revokeAuthorityWallet);
  const umi = createMetaplexUmi(connection, revokeAuthorityKeypair);
  const mint = fromWeb3JsPublicKey(new PublicKey(collectionMintAddress));
  const delegate = fromWeb3JsPublicKey(new PublicKey(delegateAddress));
  const collectionAuthorityRecord = findCollectionAuthorityRecordPda(umi, {
    mint,
    collectionAuthority: delegate
  });
  const response = await revokeCollectionAuthority(umi, {
    collectionAuthorityRecord,
    delegateAuthority: delegate,
    revokeAuthority: umi.identity,
    mint
  }).sendAndConfirm(umi);
  const signature = bs58.encode(response.signature);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Revoked collection authority ${delegateAddress} for collection mint ${collectionMintAddress}`
  });

  return {
    action: "nft-revoke-collection-authority",
    ownerAddress: revokeAuthorityKeypair.publicKey.toBase58(),
    mintAddress: collectionMintAddress,
    collectionMintAddress,
    delegateAddress,
    signature,
    skipped: false,
    notes: []
  };
}

async function executeDelegateStandard(
  connection: Connection,
  authorityWallet: LocalWalletRecord,
  mintAddress: string,
  delegateAddress: string,
  tokenStandard: TokenStandard,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const authorityKeypair = decodeWallet(authorityWallet);
  const umi = createMetaplexUmi(connection, authorityKeypair);
  const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
  const delegate = fromWeb3JsPublicKey(new PublicKey(delegateAddress));
  const response = await delegateStandardV1(umi, {
    mint,
    delegate,
    tokenOwner: fromWeb3JsPublicKey(authorityKeypair.publicKey),
    tokenStandard
  }).sendAndConfirm(umi);
  const signature = bs58.encode(response.signature);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Delegated NFT ${mintAddress} to ${delegateAddress}`
  });

  return {
    action: "nft-delegate-standard",
    ownerAddress: authorityKeypair.publicKey.toBase58(),
    mintAddress,
    delegateAddress,
    signature,
    skipped: false,
    notes: [`Token standard: ${TokenStandard[tokenStandard]}`]
  };
}

async function executeRevokeStandard(
  connection: Connection,
  authorityWallet: LocalWalletRecord,
  mintAddress: string,
  delegateAddress: string,
  tokenStandard: TokenStandard,
  onLog?: (log: BatchTaskLog) => void
): Promise<ApprovalExecutionResult> {
  const authorityKeypair = decodeWallet(authorityWallet);
  const umi = createMetaplexUmi(connection, authorityKeypair);
  const mint = fromWeb3JsPublicKey(new PublicKey(mintAddress));
  const delegate = fromWeb3JsPublicKey(new PublicKey(delegateAddress));
  const response = await revokeStandardV1(umi, {
    mint,
    delegate,
    tokenOwner: fromWeb3JsPublicKey(authorityKeypair.publicKey),
    tokenStandard
  }).sendAndConfirm(umi);
  const signature = bs58.encode(response.signature);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Revoked NFT delegate ${delegateAddress} from ${mintAddress}`
  });

  return {
    action: "nft-revoke-standard",
    ownerAddress: authorityKeypair.publicKey.toBase58(),
    mintAddress,
    delegateAddress,
    signature,
    skipped: false,
    notes: [`Token standard: ${TokenStandard[tokenStandard]}`]
  };
}

function createMetaplexUmi(connection: Connection, keypair: Keypair) {
  return createUmi(connection)
    .use(mplTokenMetadata())
    .use(keypairIdentity(fromWeb3JsKeypair(keypair)));
}

function decodeWallet(wallet: LocalWalletRecord): Keypair {
  return restoreKeypairFromSecret(
    wallet.encryptedSecretKey.startsWith("demo:") ? wallet.encryptedSecretKey : wallet.secretKeyBase58,
    import.meta.env.VITE_DEMO_SECRET_PASSPHRASE ?? "local-demo-only"
  );
}
