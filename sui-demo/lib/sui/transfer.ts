import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

import { DEFAULT_GAS_RESERVE_MIST } from "./constants";
import {
  generateWallets,
  type SupportedSuiKeypair,
  walletFromPrivateKey
} from "./wallet";

export type TransferTarget = {
  recipient: string;
  amountMist: bigint;
};

export type RelayPlan = {
  fundingAmountMist: bigint;
  hops: Array<{
    hopIndex: number;
    recipient: string;
    amountMist: bigint;
  }>;
};

export async function executeWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  target: TransferTarget
) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(target.amountMist)]);
  tx.transferObjects([coin], tx.pure.address(target.recipient));

  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true
    }
  });
}

export async function executeWithWallet(
  sendTransaction: (tx: Transaction) => Promise<{ digest: string }>,
  target: TransferTarget
) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(target.amountMist)]);
  tx.transferObjects([coin], tx.pure.address(target.recipient));
  return sendTransaction(tx);
}

export async function runOneToManyWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  targets: TransferTarget[],
  onDigest?: (digest: string, index: number) => void
) {
  const digests: string[] = [];

  for (let index = 0; index < targets.length; index += 1) {
    const result = await executeWithKeypair(client, keypair, targets[index]);
    digests.push(result.digest);
    onDigest?.(result.digest, index);
  }

  return digests;
}

export async function runOneToManyWithWallet(
  sendTransaction: (tx: Transaction) => Promise<{ digest: string }>,
  targets: TransferTarget[],
  onDigest?: (digest: string, index: number) => void
) {
  const digests: string[] = [];

  for (let index = 0; index < targets.length; index += 1) {
    const result = await executeWithWallet(sendTransaction, targets[index]);
    digests.push(result.digest);
    onDigest?.(result.digest, index);
  }

  return digests;
}

export function buildRelayPlan(
  finalRecipient: string,
  finalAmountMist: bigint,
  relayAddresses: string[],
  gasReserveMist = DEFAULT_GAS_RESERVE_MIST
): RelayPlan {
  const hops: RelayPlan["hops"] = [];
  let amountToForward = finalAmountMist;

  for (let index = relayAddresses.length - 1; index >= 0; index -= 1) {
    amountToForward += gasReserveMist;
    hops.unshift({
      hopIndex: index + 1,
      recipient: relayAddresses[index],
      amountMist: amountToForward
    });
  }

  const lastHopAmount = relayAddresses.length > 0 ? finalAmountMist : finalAmountMist;
  hops.push({
    hopIndex: relayAddresses.length + 1,
    recipient: finalRecipient,
    amountMist: lastHopAmount
  });

  return {
    fundingAmountMist: relayAddresses.length > 0 ? hops[0].amountMist : finalAmountMist,
    hops
  };
}

export async function runRelayWithKeypair(
  client: SuiClient,
  sourceKeypair: SupportedSuiKeypair,
  finalRecipient: string,
  finalAmountMist: bigint,
  hopCount: number,
  onDigest?: (digest: string, message: string) => void
) {
  const relayWallets = generateWallets(hopCount);
  const plan = buildRelayPlan(
    finalRecipient,
    finalAmountMist,
    relayWallets.map((wallet) => wallet.address)
  );

  if (relayWallets.length === 0) {
    const result = await executeWithKeypair(client, sourceKeypair, {
      recipient: finalRecipient,
      amountMist: finalAmountMist
    });
    onDigest?.(result.digest, "Source wallet sent directly to final recipient.");
    return { relayWallets, plan, digests: [result.digest] };
  }

  const digests: string[] = [];
  let currentKeypair: SupportedSuiKeypair = sourceKeypair;

  for (let index = 0; index < relayWallets.length; index += 1) {
    const currentWallet = relayWallets[index];
    const result = await executeWithKeypair(client, currentKeypair, {
      recipient: currentWallet.address,
      amountMist: plan.hops[index].amountMist
    });
    digests.push(result.digest);
    onDigest?.(result.digest, `Relay hop ${index + 1} funded ${currentWallet.address}.`);
    currentKeypair = walletFromPrivateKey(currentWallet.privateKey).keypair;
  }

  const finalDigest = await executeWithKeypair(client, currentKeypair, {
    recipient: finalRecipient,
    amountMist: finalAmountMist
  });
  digests.push(finalDigest.digest);
  onDigest?.(finalDigest.digest, "Final relay hop sent funds to the destination.");

  return { relayWallets, plan, digests };
}
