import {
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  type Connection,
  type Keypair
} from "@solana/web3.js";

import { DEFAULT_BATCH_CONCURRENCY, DEFAULT_RETRY_TIMES } from "../solana/constants";
import { mapWithConcurrency, withRetry } from "../utils/async-task";
import { restoreKeypairFromSecret } from "../wallet/keypair-storage";
import type { BatchTaskLog } from "../../types/task";
import type {
  ManyToManyTransferInput,
  RelayTransferInput,
  TransferAssetInput,
  TransferExecutionResult,
  TransferRecipientInput
} from "../../types/transfer";
import type { LocalWalletRecord } from "../../types/wallet";

interface ResolvedTransferAsset {
  kind: "sol" | "spl";
  decimals: number;
  mint?: PublicKey;
  mintAddress?: string;
}

export const transferService = {
  async oneToMany(
    connection: Connection,
    sourceWallet: LocalWalletRecord,
    recipients: TransferRecipientInput[],
    asset: TransferAssetInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<TransferExecutionResult[]> {
    const sourceKeypair = decodeWallet(sourceWallet);
    const resolvedAsset = await resolveTransferAsset(connection, asset);
    const results: TransferExecutionResult[] = [];

    // Serialize transfers for the same source wallet to avoid account write contention.
    for (const recipient of recipients) {
      const result = await executeTransferSafely({
        action: () =>
          transferAsset(
            connection,
            sourceKeypair,
            recipient.address,
            recipient.amount,
            resolvedAsset,
            onLog
          ),
        sourceAddress: sourceKeypair.publicKey.toBase58(),
        destinationAddress: recipient.address,
        amount: recipient.amount,
        asset: resolvedAsset,
        onLog
      });

      results.push(result);
    }

    return results;
  },

  async manyToOne(
    connection: Connection,
    wallets: LocalWalletRecord[],
    destinationAddress: string,
    reserveAmount: string,
    asset: TransferAssetInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<TransferExecutionResult[]> {
    const resolvedAsset = await resolveTransferAsset(connection, asset);
    assertValidPublicKey(destinationAddress, "Destination address");

    const result = await mapWithConcurrency(
      wallets,
      async (wallet) =>
        executeTransferSafely({
          action: () =>
            collectToOne(
              connection,
              wallet,
              destinationAddress,
              reserveAmount,
              resolvedAsset,
              onLog
            ),
          sourceAddress: wallet.publicKey,
          destinationAddress,
          amount: reserveAmount,
          asset: resolvedAsset,
          onLog
        }),
      {
        concurrency: DEFAULT_BATCH_CONCURRENCY,
        onLog
      }
    );

    return result.items;
  },

  async manyToMany(
    connection: Connection,
    tasks: Array<ManyToManyTransferInput & { wallet: LocalWalletRecord }>,
    asset: TransferAssetInput,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<TransferExecutionResult[]> {
    const resolvedAsset = await resolveTransferAsset(connection, asset);
    const taskGroups = groupTasksByWallet(tasks);

    const result = await mapWithConcurrency(
      taskGroups,
      async (group) => {
        const groupResults: TransferExecutionResult[] = [];

        // Transfers from the same wallet are serialized; different wallets may run concurrently.
        for (const task of group) {
          const groupResult = await executeTransferSafely({
            action: () =>
              transferAsset(
                connection,
                decodeWallet(task.wallet),
                task.destinationAddress,
                task.amount,
                resolvedAsset,
                onLog
              ),
            sourceAddress: task.wallet.publicKey,
            destinationAddress: task.destinationAddress,
            amount: task.amount,
            asset: resolvedAsset,
            onLog
          });

          groupResults.push(groupResult);
        }

        return groupResults;
      },
      {
        concurrency: DEFAULT_BATCH_CONCURRENCY,
        onLog
      }
    );

    return result.items.flat();
  },

  async relay(
    connection: Connection,
    input: RelayTransferInput,
    sourceWallet: LocalWalletRecord,
    relayWallet: LocalWalletRecord,
    onLog?: (log: BatchTaskLog) => void
  ): Promise<TransferExecutionResult[]> {
    const sourceKeypair = decodeWallet(sourceWallet);
    const relayKeypair = decodeWallet(relayWallet);
    const resolvedAsset = await resolveTransferAsset(connection, input.asset);

    validateRelayInput(input, resolvedAsset, sourceWallet.publicKey, relayWallet.publicKey);

    const first = await executeTransferSafely({
      action: () =>
        transferAsset(
          connection,
          sourceKeypair,
          input.relayAddress,
          input.sourceToRelayAmount,
          resolvedAsset,
          onLog
        ),
      sourceAddress: sourceWallet.publicKey,
      destinationAddress: input.relayAddress,
      amount: input.sourceToRelayAmount,
      asset: resolvedAsset,
      onLog
    });

    if (first.status !== "success") {
      return [first];
    }

    const second = await executeTransferSafely({
      action: () =>
        transferAsset(
          connection,
          relayKeypair,
          input.destinationAddress,
          input.relayToDestinationAmount,
          resolvedAsset,
          onLog
        ),
      sourceAddress: relayWallet.publicKey,
      destinationAddress: input.destinationAddress,
      amount: input.relayToDestinationAmount,
      asset: resolvedAsset,
      onLog
    });

    return [first, second];
  }
};

export function parseRecipientsText(text: string): TransferRecipientInput[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [address, amount] = line.split(/[,\s]+/).map((item) => item.trim());

      if (!address || !amount || !isPositiveAmount(amount)) {
        throw new Error(`Invalid recipient line ${index + 1}. Use "address,amount".`);
      }

      assertValidPublicKey(address, `Recipient address on line ${index + 1}`);

      return { address, amount };
    });
}

export function parseManyToManyText(text: string): ManyToManyTransferInput[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [sourceAddress, destinationAddress, amount] = line
        .split(/[,\s]+/)
        .map((item) => item.trim());

      if (!sourceAddress || !destinationAddress || !amount || !isPositiveAmount(amount)) {
        throw new Error(
          `Invalid transfer line ${index + 1}. Use "sourceAddress,destinationAddress,amount".`
        );
      }

      assertValidPublicKey(sourceAddress, `Source address on line ${index + 1}`);
      assertValidPublicKey(destinationAddress, `Destination address on line ${index + 1}`);

      return { sourceAddress, destinationAddress, amount };
    });
}

export function validateTransferForm(input: {
  asset: TransferAssetInput;
  destinationAddress?: string;
  sourceWalletId?: string;
  relayWalletId?: string;
  selectedWalletCount?: number;
}) {
  if (input.asset.kind === "spl" && !input.asset.mintAddress?.trim()) {
    throw new Error("Mint address is required when transferring SPL tokens.");
  }

  if (input.destinationAddress?.trim()) {
    assertValidPublicKey(input.destinationAddress, "Destination address");
  }

  if (input.sourceWalletId && input.relayWalletId && input.sourceWalletId === input.relayWalletId) {
    throw new Error("Source wallet and relay wallet must be different.");
  }

  if (input.selectedWalletCount !== undefined && input.selectedWalletCount <= 0) {
    throw new Error("Please select at least one wallet.");
  }
}

function decodeWallet(wallet: LocalWalletRecord): Keypair {
  return restoreKeypairFromSecret(
    wallet.encryptedSecretKey.startsWith("demo:") ? wallet.encryptedSecretKey : wallet.secretKeyBase58,
    import.meta.env.VITE_DEMO_SECRET_PASSPHRASE ?? "local-demo-only"
  );
}

async function resolveTransferAsset(
  connection: Connection,
  asset: TransferAssetInput
): Promise<ResolvedTransferAsset> {
  if (asset.kind === "sol") {
    return {
      kind: "sol",
      decimals: 9
    };
  }

  if (!asset.mintAddress?.trim()) {
    throw new Error("Mint address is required when transferring SPL tokens.");
  }

  const mint = assertValidPublicKey(asset.mintAddress.trim(), "Mint address");
  const mintInfo = await getMint(connection, mint);

  return {
    kind: "spl",
    decimals: mintInfo.decimals,
    mint,
    mintAddress: mint.toBase58()
  };
}

async function collectToOne(
  connection: Connection,
  wallet: LocalWalletRecord,
  destinationAddress: string,
  reserveAmount: string,
  asset: ResolvedTransferAsset,
  onLog?: (log: BatchTaskLog) => void
): Promise<TransferExecutionResult> {
  const sourceKeypair = decodeWallet(wallet);
  const sourceAddress = sourceKeypair.publicKey.toBase58();
  const destination = assertValidPublicKey(destinationAddress, "Destination address");
  const reserveBaseUnits = toBaseUnits(reserveAmount || "0", asset.decimals);

  if (asset.kind === "sol") {
    const balance = BigInt(await connection.getBalance(sourceKeypair.publicKey));
    const fee = BigInt(await estimateSystemTransferFee(connection, sourceKeypair.publicKey, destination));
    const transferableBaseUnits = balance - reserveBaseUnits - fee;

    if (transferableBaseUnits <= 0n) {
      return buildSkippedResult(
        sourceAddress,
        destinationAddress,
        "0",
        asset,
        "Insufficient balance after reserved lamports and estimated fee."
      );
    }

    return transferAsset(
      connection,
      sourceKeypair,
      destinationAddress,
      fromBaseUnits(transferableBaseUnits, asset.decimals),
      asset,
      onLog
    );
  }

  const sourceAtaAddress = getAssociatedTokenAddressSync(asset.mint!, sourceKeypair.publicKey);
  const sourceAtaInfo = await connection.getAccountInfo(sourceAtaAddress);

  if (!sourceAtaInfo) {
    return buildSkippedResult(
      sourceAddress,
      destinationAddress,
      "0",
      asset,
      "Source wallet does not have an associated token account for the selected mint."
    );
  }

  const sourceAccount = await getAccount(connection, sourceAtaAddress);
  const transferableBaseUnits = sourceAccount.amount - reserveBaseUnits;

  if (transferableBaseUnits <= 0n) {
    return buildSkippedResult(
      sourceAddress,
      destinationAddress,
      "0",
      asset,
      "Insufficient token balance after reserved amount."
    );
  }

  const sourceSolBalance = BigInt(await connection.getBalance(sourceKeypair.publicKey));
  const destinationAtaAddress = getAssociatedTokenAddressSync(asset.mint!, destination);
  const destinationAtaInfo = await connection.getAccountInfo(destinationAtaAddress);
  let requiredSol = BigInt(await estimateSystemTransferFee(connection, sourceKeypair.publicKey, destination));

  if (!destinationAtaInfo) {
    requiredSol += BigInt(await connection.getMinimumBalanceForRentExemption(165));
  }

  if (sourceSolBalance < requiredSol) {
    return buildSkippedResult(
      sourceAddress,
      destinationAddress,
      "0",
      asset,
      "Source wallet does not have enough SOL to pay token transfer fees or destination ATA rent."
    );
  }

  return transferAsset(
    connection,
    sourceKeypair,
    destinationAddress,
    fromBaseUnits(transferableBaseUnits, asset.decimals),
    asset,
    onLog
  );
}

async function transferAsset(
  connection: Connection,
  sourceKeypair: Keypair,
  destinationAddress: string,
  amount: string,
  asset: ResolvedTransferAsset,
  onLog?: (log: BatchTaskLog) => void
): Promise<TransferExecutionResult> {
  const destination = assertValidPublicKey(destinationAddress, "Destination address");
  const baseUnits = toBaseUnits(amount, asset.decimals);

  if (baseUnits <= 0n) {
    throw new Error("Transfer amount must be greater than 0.");
  }

  if (asset.kind === "sol") {
    if (baseUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("SOL transfer amount is too large for the current transaction builder.");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sourceKeypair.publicKey,
        toPubkey: destination,
        lamports: Number(baseUnits)
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [sourceKeypair]);
    const normalizedAmount = fromBaseUnits(baseUnits, asset.decimals);

    onLog?.({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `Transferred ${normalizedAmount} SOL from ${sourceKeypair.publicKey.toBase58()} to ${destinationAddress}`
    });

    return buildSuccessResult(
      sourceKeypair.publicKey.toBase58(),
      destinationAddress,
      normalizedAmount,
      asset,
      signature
    );
  }

  const sourceAtaAddress = getAssociatedTokenAddressSync(asset.mint!, sourceKeypair.publicKey);
  const sourceAtaInfo = await connection.getAccountInfo(sourceAtaAddress);

  if (!sourceAtaInfo) {
    throw new Error("Source wallet does not have an associated token account for the selected mint.");
  }

  const sourceAccount = await getAccount(connection, sourceAtaAddress);

  if (sourceAccount.amount < baseUnits) {
    throw new Error("Source wallet does not have enough token balance for this transfer.");
  }

  const destinationAtaAddress = getAssociatedTokenAddressSync(asset.mint!, destination);
  const destinationAtaInfo = await connection.getAccountInfo(destinationAtaAddress);
  const sourceSolBalance = BigInt(await connection.getBalance(sourceKeypair.publicKey));
  let requiredSol = BigInt(await estimateSystemTransferFee(connection, sourceKeypair.publicKey, destination));

  if (!destinationAtaInfo) {
    requiredSol += BigInt(await connection.getMinimumBalanceForRentExemption(165));
  }

  if (sourceSolBalance < requiredSol) {
    throw new Error("Source wallet does not have enough SOL to pay token transfer fees or ATA rent.");
  }

  const destinationAta = await getOrCreateAssociatedTokenAccount(
    connection,
    sourceKeypair,
    asset.mint!,
    destination
  );
  const transaction = new Transaction().add(
    createTransferCheckedInstruction(
      sourceAtaAddress,
      asset.mint!,
      destinationAta.address,
      sourceKeypair.publicKey,
      baseUnits,
      asset.decimals
    )
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [sourceKeypair]);
  const normalizedAmount = fromBaseUnits(baseUnits, asset.decimals);

  onLog?.({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Transferred ${normalizedAmount} token(s) of ${asset.mintAddress} from ${sourceKeypair.publicKey.toBase58()} to ${destinationAddress}`
  });

  return buildSuccessResult(
    sourceKeypair.publicKey.toBase58(),
    destinationAddress,
    normalizedAmount,
    asset,
    signature
  );
}

async function executeTransferSafely(input: {
  action: () => Promise<TransferExecutionResult>;
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  asset: ResolvedTransferAsset;
  onLog?: (log: BatchTaskLog) => void;
}): Promise<TransferExecutionResult> {
  try {
    return await withRetry(input.action, DEFAULT_RETRY_TIMES, input.onLog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transfer error.";

    input.onLog?.({
      timestamp: new Date().toISOString(),
      level: "error",
      message: `Transfer failed from ${input.sourceAddress} to ${input.destinationAddress}: ${message}`
    });

    return buildFailedResult(
      input.sourceAddress,
      input.destinationAddress,
      input.amount,
      input.asset,
      message
    );
  }
}

function validateRelayInput(
  input: RelayTransferInput,
  asset: ResolvedTransferAsset,
  sourceWalletAddress: string,
  relayWalletAddress: string
) {
  assertValidPublicKey(input.destinationAddress, "Destination address");
  assertValidPublicKey(input.relayAddress, "Relay address");

  if (sourceWalletAddress === relayWalletAddress) {
    throw new Error("Source wallet and relay wallet must be different.");
  }

  const firstAmount = toBaseUnits(input.sourceToRelayAmount, asset.decimals);
  const secondAmount = toBaseUnits(input.relayToDestinationAmount, asset.decimals);

  if (asset.kind === "spl" && firstAmount < secondAmount) {
    throw new Error("Source-to-relay amount must be greater than or equal to relay-to-destination amount for SPL token relay.");
  }

  if (asset.kind === "sol" && firstAmount <= secondAmount) {
    throw new Error("For SOL relay, source-to-relay amount must be greater than relay-to-destination amount to leave room for fees.");
  }
}

function groupTasksByWallet(tasks: Array<ManyToManyTransferInput & { wallet: LocalWalletRecord }>) {
  const groups = new Map<string, Array<ManyToManyTransferInput & { wallet: LocalWalletRecord }>>();

  for (const task of tasks) {
    const bucket = groups.get(task.wallet.publicKey);

    if (bucket) {
      bucket.push(task);
      continue;
    }

    groups.set(task.wallet.publicKey, [task]);
  }

  return Array.from(groups.values());
}

function buildSuccessResult(
  sourceAddress: string,
  destinationAddress: string,
  amount: string,
  asset: ResolvedTransferAsset,
  signature: string
): TransferExecutionResult {
  return {
    sourceAddress,
    destinationAddress,
    amount,
    assetKind: asset.kind,
    mintAddress: asset.mintAddress,
    decimals: asset.decimals,
    status: "success",
    signature,
    skipped: false,
    notes: []
  };
}

function buildFailedResult(
  sourceAddress: string,
  destinationAddress: string,
  amount: string,
  asset: ResolvedTransferAsset,
  note: string
): TransferExecutionResult {
  return {
    sourceAddress,
    destinationAddress,
    amount,
    assetKind: asset.kind,
    mintAddress: asset.mintAddress,
    decimals: asset.decimals,
    status: "failed",
    skipped: false,
    notes: [note]
  };
}

function buildSkippedResult(
  sourceAddress: string,
  destinationAddress: string,
  amount: string,
  asset: ResolvedTransferAsset,
  note: string
): TransferExecutionResult {
  return {
    sourceAddress,
    destinationAddress,
    amount,
    assetKind: asset.kind,
    mintAddress: asset.mintAddress,
    decimals: asset.decimals,
    status: "skipped",
    skipped: true,
    notes: [note]
  };
}

async function estimateSystemTransferFee(
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

function isPositiveAmount(input: string): boolean {
  return /^(\d+)(\.\d+)?$/.test(input) && Number(input) > 0;
}

function assertValidPublicKey(address: string, label: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch {
    throw new Error(`${label} is not a valid Solana address.`);
  }
}

function toBaseUnits(amount: string, decimals: number): bigint {
  const normalized = amount.trim();

  if (!/^(\d+)(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");

  if (fractionPart.length > decimals) {
    throw new Error(`Amount ${amount} exceeds supported decimal places (${decimals}).`);
  }

  const paddedFraction = fractionPart.padEnd(decimals, "0");
  const combined = `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, "");

  return BigInt(combined || "0");
}

function fromBaseUnits(amount: bigint, decimals: number): string {
  const negative = amount < 0n;
  const absolute = negative ? amount * -1n : amount;
  const raw = absolute.toString().padStart(decimals + 1, "0");

  if (decimals === 0) {
    return `${negative ? "-" : ""}${raw}`;
  }

  const whole = raw.slice(0, -decimals);
  const fraction = raw.slice(-decimals).replace(/0+$/, "");

  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}
