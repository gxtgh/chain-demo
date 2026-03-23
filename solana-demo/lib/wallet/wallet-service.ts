import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import { DEFAULT_BATCH_CONCURRENCY, DEFAULT_RETRY_TIMES, DEMO_SECRET_PASSPHRASE } from "../solana/constants";
import { mapWithConcurrency, withRetry } from "../utils/async-task";
import { createGeneratedWallets } from "./file-codec";
import { createLocalWalletRecord, restoreKeypairFromSecret } from "./keypair-storage";
import { solscanClient } from "../solscan/solscan-client";
import type { BatchTaskLog } from "../../types/task";
import type {
  LocalWalletRecord,
  RentRecoveryResult,
  VanitySearchInput,
  VanitySearchMatch,
  WalletBalanceSnapshot,
  WalletMigrationResult,
  WalletTokenBalance
} from "../../types/wallet";
import type { RentScanResult } from "../../types/rent";
import type { Connection, ParsedAccountData } from "@solana/web3.js";

export const walletService = {
  generateWallets(count: number): LocalWalletRecord[] {
    return createGeneratedWallets(count);
  },

  async findVanityWallets(
    input: VanitySearchInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<VanitySearchMatch[]> {
    validateVanityPattern(input.prefix, "prefix");
    validateVanityPattern(input.suffix, "suffix");

    const matches: VanitySearchMatch[] = [];
    let attempts = 0;
    const batchSize = 2000;

    onLog?.({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `Started vanity search. prefix=${input.prefix ?? "-"} suffix=${input.suffix ?? "-"} limit=${input.limit} maxAttempts=${input.maxAttempts}`
    });

    while (matches.length < input.limit && attempts < input.maxAttempts) {
      const batchEnd = Math.min(attempts + batchSize, input.maxAttempts);

      while (matches.length < input.limit && attempts < batchEnd) {
        attempts += 1;
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const matchedPrefix = input.prefix ? publicKey.startsWith(input.prefix) : true;
        const matchedSuffix = input.suffix ? publicKey.endsWith(input.suffix) : true;

        if (!matchedPrefix || !matchedSuffix) {
          continue;
        }

        const wallet = createLocalWalletRecord(keypair, DEMO_SECRET_PASSPHRASE, {
          label: `Vanity ${matches.length + 1}`,
          origin: "vanity"
        });

        matches.push({ wallet, attempts });
        onLog?.({
          timestamp: new Date().toISOString(),
          level: "info",
          message: `Matched vanity wallet ${publicKey} after ${attempts} attempts`
        });
      }

      onLog?.({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Vanity search progress: ${attempts}/${input.maxAttempts} attempts, ${matches.length} match(es)`
      });

      // Yield to the browser so the UI and logs can update during long searches.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    onLog?.({
      timestamp: new Date().toISOString(),
      level: matches.length > 0 ? "info" : "error",
      message:
        matches.length > 0
          ? `Vanity search completed with ${matches.length} match(es) after ${attempts} attempts`
          : `Vanity search finished after ${attempts} attempts with no matches`
    });

    return matches;
  },

  async queryBalances(
    connection: Connection,
    addresses: string[],
    onLog?: (log: BatchTaskLog) => void
  ): Promise<WalletBalanceSnapshot[]> {
    const normalizedAddresses = Array.from(
      new Set(addresses.map((item) => item.trim()).filter(Boolean))
    );

    const result = await mapWithConcurrency(
      normalizedAddresses,
      async (address) =>
        withRetry(
          () => getWalletSnapshot(connection, address, onLog),
          DEFAULT_RETRY_TIMES,
          onLog
        ),
      {
        concurrency: DEFAULT_BATCH_CONCURRENCY,
        onLog
      }
    );

    return result.items;
  },

  async migrateWallets(
    connection: Connection,
    wallets: LocalWalletRecord[],
    destinationAddress: string,
    options?: {
      keepLamports?: number;
      includeTokens?: boolean;
      concurrency?: number;
      onLog?: (log: BatchTaskLog) => void;
    }
  ): Promise<WalletMigrationResult[]> {
    const destination = new PublicKey(destinationAddress);

    const result = await mapWithConcurrency(
      wallets,
      async (wallet) =>
        withRetry(
          () =>
            migrateSingleWallet(connection, wallet, destination, {
              keepLamports: options?.keepLamports ?? 1_000_000,
              includeTokens: options?.includeTokens ?? true,
              onLog: options?.onLog
            }),
          DEFAULT_RETRY_TIMES,
          options?.onLog
        ),
      {
        concurrency: options?.concurrency ?? DEFAULT_BATCH_CONCURRENCY,
        onLog: options?.onLog
      }
    );

    return result.items;
  },

  restoreKeypair(secret: string): Keypair {
    return restoreKeypairFromSecret(secret, DEMO_SECRET_PASSPHRASE);
  }
};

const base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function validateVanityPattern(
  pattern: string | undefined,
  label: "prefix" | "suffix"
): void {
  if (!pattern) {
    return;
  }

  for (const char of pattern) {
    if (!base58Alphabet.includes(char)) {
      throw new Error(
        `Invalid ${label} character "${char}". Solana addresses use Base58, so 0, O, I and l are not allowed.`
      );
    }
  }
}

export async function getWalletSnapshot(
  connection: Connection,
  address: string,
  onLog?: (log: BatchTaskLog) => void
): Promise<WalletBalanceSnapshot> {
  const publicKey = new PublicKey(address);
  const lamports = await connection.getBalance(publicKey);
  const tokens = await queryTokenBalances(connection, publicKey, onLog);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Fetched balance for ${address}`
  });

  return {
    address,
    lamports,
    sol: lamports / LAMPORTS_PER_SOL,
    tokens
  };
}

export async function recoverRentForWallets(
  connection: Connection,
  wallets: LocalWalletRecord[],
  options?: {
    concurrency?: number;
    onLog?: (log: BatchTaskLog) => void;
  }
): Promise<RentRecoveryResult[]> {
  const result = await mapWithConcurrency(
    wallets,
    async (wallet) =>
      withRetry(
        () => recoverRentForWallet(connection, wallet, options?.onLog),
        DEFAULT_RETRY_TIMES,
        options?.onLog
      ),
    {
      concurrency: options?.concurrency ?? DEFAULT_BATCH_CONCURRENCY,
      onLog: options?.onLog
    }
  );

  return result.items;
}

export async function scanRecoverableRentForWallets(
  connection: Connection,
  wallets: LocalWalletRecord[],
  options?: {
    concurrency?: number;
    onLog?: (log: BatchTaskLog) => void;
  }
): Promise<RentScanResult[]> {
  const result = await mapWithConcurrency(
    wallets,
    async (wallet) =>
      withRetry(
        () => scanRecoverableRentForWallet(connection, wallet, options?.onLog),
        DEFAULT_RETRY_TIMES,
        options?.onLog
      ),
    {
      concurrency: options?.concurrency ?? DEFAULT_BATCH_CONCURRENCY,
      onLog: options?.onLog
    }
  );

  return result.items;
}

async function queryTokenBalances(
  connection: Connection,
  owner: PublicKey,
  onLog?: (log: BatchTaskLog) => void
): Promise<WalletTokenBalance[]> {
  // The teaching path prefers Solscan metadata first so students can compare
  // an indexer-based query layer with the raw RPC fallback below.
  try {
    const solscanTokens = await solscanClient.getTokenAccounts(owner.toBase58());

    if (solscanTokens.length > 0) {
      return solscanTokens.map((item) => ({
        mint: item.token_address,
        tokenAccount: item.token_account,
        amountRaw: String(item.amount),
        amountUi: Number(item.amount) / 10 ** item.token_decimals,
        decimals: item.token_decimals,
        symbol: item.token_symbol,
        name: item.token_name
      }));
    }
  } catch (error) {
    onLog?.({
      timestamp: new Date().toISOString(),
      level: "error",
      message:
        error instanceof Error
          ? `Solscan fallback triggered: ${error.message}`
          : "Solscan fallback triggered."
    });
  }

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID
  });

  return tokenAccounts.value
    .map((item) => {
      const parsed = item.account.data as ParsedAccountData;
      const tokenAmount = parsed.parsed.info.tokenAmount;

      return {
        mint: parsed.parsed.info.mint as string,
        tokenAccount: item.pubkey.toBase58(),
        amountRaw: tokenAmount.amount as string,
        amountUi: Number(tokenAmount.uiAmount ?? 0),
        decimals: Number(tokenAmount.decimals),
        symbol: undefined,
        name: undefined
      };
    })
    .filter((item) => Number(item.amountRaw) > 0);
}

async function migrateSingleWallet(
  connection: Connection,
  wallet: LocalWalletRecord,
  destination: PublicKey,
  options: {
    keepLamports: number;
    includeTokens: boolean;
    onLog?: (log: BatchTaskLog) => void;
  }
): Promise<WalletMigrationResult> {
  const sourceKeypair = restoreKeypairFromSecret(
    wallet.encryptedSecretKey,
    DEMO_SECRET_PASSPHRASE
  );
  const sourceAddress = sourceKeypair.publicKey.toBase58();
  const notes: string[] = [];
  const tokenTransfers: WalletMigrationResult["tokenTransfers"] = [];

  if (options.includeTokens) {
    // We move each token account in its own transaction to keep the flow easy
    // to read and to avoid oversized transactions in a teaching demo.
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      sourceKeypair.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    for (const item of tokenAccounts.value) {
      const parsed = item.account.data as ParsedAccountData;
      const tokenAmount = parsed.parsed.info.tokenAmount;
      const amountRaw = String(tokenAmount.amount);

      if (amountRaw === "0") {
        continue;
      }

      const mint = new PublicKey(parsed.parsed.info.mint as string);
      const decimals = Number(tokenAmount.decimals);
      const amountUi = Number(tokenAmount.uiAmount ?? 0);
      const destinationAta = getAssociatedTokenAddressSync(
        mint,
        destination,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const destinationAtaInfo = await connection.getAccountInfo(destinationAta);
      const transaction = new Transaction();

      if (!destinationAtaInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            sourceKeypair.publicKey,
            destinationAta,
            destination,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createTransferCheckedInstruction(
          item.pubkey,
          mint,
          destinationAta,
          sourceKeypair.publicKey,
          BigInt(amountRaw),
          decimals
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [
        sourceKeypair
      ]);

      tokenTransfers.push({
        mint: mint.toBase58(),
        tokenAccount: item.pubkey.toBase58(),
        amountRaw,
        amountUi,
        signature
      });

      options.onLog?.({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Migrated token ${mint.toBase58()} from ${sourceAddress}`
      });
    }
  }

  const balance = await connection.getBalance(sourceKeypair.publicKey);
  const fee = await estimateTransferFee(connection, sourceKeypair.publicKey, destination);
  const transferableLamports = balance - options.keepLamports - fee;

  if (transferableLamports <= 0) {
    notes.push("Insufficient SOL after keeping reserve and estimated fee.");

    return {
      sourceAddress,
      solTransferredLamports: 0,
      solTransferred: 0,
      tokenTransfers,
      skipped: tokenTransfers.length === 0,
      notes
    };
  }

  const solTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sourceKeypair.publicKey,
      toPubkey: destination,
      lamports: transferableLamports
    })
  );

  const solSignature = await sendAndConfirmTransaction(connection, solTransaction, [
    sourceKeypair
  ]);

  options.onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Migrated ${transferableLamports / LAMPORTS_PER_SOL} SOL from ${sourceAddress}`
  });

  return {
    sourceAddress,
    solTransferredLamports: transferableLamports,
    solTransferred: transferableLamports / LAMPORTS_PER_SOL,
    solSignature,
    tokenTransfers,
    skipped: false,
    notes
  };
}

async function recoverRentForWallet(
  connection: Connection,
  wallet: LocalWalletRecord,
  onLog?: (log: BatchTaskLog) => void
): Promise<RentRecoveryResult> {
  const owner = restoreKeypairFromSecret(wallet.encryptedSecretKey, DEMO_SECRET_PASSPHRASE);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner.publicKey, {
    programId: TOKEN_PROGRAM_ID
  });

  const emptyAccounts = tokenAccounts.value.filter((item) => {
    const parsed = item.account.data as ParsedAccountData;
    return String(parsed.parsed.info.tokenAmount.amount) === "0";
  });

  if (emptyAccounts.length === 0) {
    return {
      ownerAddress: owner.publicKey.toBase58(),
      closedAccounts: [],
      signatures: [],
      recoveredLamports: 0,
      skipped: true,
      notes: ["No empty SPL token accounts were found."]
    };
  }

  const signatures: string[] = [];
  const closedAccounts: string[] = [];
  let recoveredLamports = 0;

  for (const item of emptyAccounts) {
    // Closing zero-balance token accounts is the canonical rent recovery path
    // for SPL accounts owned by the current wallet.
    const accountLamports = await connection.getBalance(item.pubkey);
    const transaction = new Transaction().add(
      createCloseAccountInstruction(item.pubkey, owner.publicKey, owner.publicKey)
    );
    const signature = await sendAndConfirmTransaction(connection, transaction, [owner]);

    signatures.push(signature);
    closedAccounts.push(item.pubkey.toBase58());
    recoveredLamports += accountLamports;

    onLog?.({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `Closed empty token account ${item.pubkey.toBase58()}`
    });
  }

  return {
    ownerAddress: owner.publicKey.toBase58(),
    closedAccounts,
    signatures,
    recoveredLamports,
    skipped: false,
    notes: []
  };
}

async function scanRecoverableRentForWallet(
  connection: Connection,
  wallet: LocalWalletRecord,
  onLog?: (log: BatchTaskLog) => void
): Promise<RentScanResult> {
  const owner = restoreKeypairFromSecret(wallet.encryptedSecretKey, DEMO_SECRET_PASSPHRASE);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner.publicKey, {
    programId: TOKEN_PROGRAM_ID
  });

  const emptyAccounts = tokenAccounts.value.filter((item) => {
    const parsed = item.account.data as ParsedAccountData;
    return String(parsed.parsed.info.tokenAmount.amount) === "0";
  });

  if (emptyAccounts.length === 0) {
    return {
      ownerAddress: owner.publicKey.toBase58(),
      recoverableAccounts: [],
      recoverableLamports: 0,
      recoverableSol: 0,
      skipped: true,
      notes: ["No empty SPL token accounts were found."]
    };
  }

  const recoverableAccounts = await Promise.all(
    emptyAccounts.map(async (item) => ({
      tokenAccount: item.pubkey.toBase58(),
      lamports: await connection.getBalance(item.pubkey)
    }))
  );

  const recoverableLamports = recoverableAccounts.reduce(
    (sum, item) => sum + item.lamports,
    0
  );

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Scanned ${recoverableAccounts.length} recoverable token account(s) for ${owner.publicKey.toBase58()}`
  });

  return {
    ownerAddress: owner.publicKey.toBase58(),
    recoverableAccounts,
    recoverableLamports,
    recoverableSol: recoverableLamports / LAMPORTS_PER_SOL,
    skipped: false,
    notes: []
  };
}

async function estimateTransferFee(
  connection: Connection,
  payer: PublicKey,
  destination: PublicKey
): Promise<number> {
  const latestBlockhash = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    feePayer: payer,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: destination,
      lamports: 1
    })
  );
  const message = transaction.compileMessage();
  const fee = await connection.getFeeForMessage(message);
  return fee.value ?? 5000;
}
