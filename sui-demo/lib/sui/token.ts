import type { SuiClient } from "@mysten/sui/client";
import { fromBase64 } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

import type { SupportedSuiKeypair } from "./wallet";
import { parseHumanUnits } from "../utils/format";

const MODULES_BASE64 = [
  "oRzrCwYAAAAJAQAOAg4yA0AoBGgQBXiPAQeHAvIBCPkDYArZBAYM3wRXAAwBFgIKAgsCEwIXAhgAAAgAAQYHAAIBDAEAAQIEDAEAAQIHDAEAAQMCCAADAwABAAEDBQwBAAEECQQABggCAAAPAAEAAhEICQEAAw0QEQEAAxANDgEAAxIGBwEIBRQLAQEMBhUDBAAEBQEFBQoFDAMFBQ8CBQUSCAcIBQIIAQgBCAEIAQMHCAkAAwsGAQgABQsEAQgAAQYICQEFAQgABwcIBQIIAQgBCAEIAQcICQILBgEJAAsEAQkAAwcLBAEJAAMHCAkBCwIBCQABCwIBCAACCQAFAQsEAQgAAwcLBgEJAAEHCAkBCwMBCQABCwMBCAACCwYBCQAHCAkBCwcBCQABCwcBCAAEQ09JTgRDb2luDENvaW5SZWdpc3RyeRNDdXJyZW5jeUluaXRpYWxpemVyCURlbnlDYXBWMgtNZXRhZGF0YUNhcAZTdHJpbmcLVHJlYXN1cnlDYXAJVHhDb250ZXh0A1VJRARjb2luDWNvaW5fcmVnaXN0cnkIY3VycmVuY3kIZmluYWxpemUCaWQNaW5pdF9jdXJyZW5jeQ5tYWtlX3JlZ3VsYXRlZARtaW50DG5ld19jdXJyZW5jeQZvYmplY3QPcHVibGljX3RyYW5zZmVyBnNlbmRlcgZzdHJpbmcIdHJhbnNmZXIKdHhfY29udGV4dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAQ4ICAABBAACJwoHLhEGDAkLAAsBCwILAwsECwUKBzgADAoMCAoGBgAAAAAAAAAAJAQYDQoLBgoHOAEKCTgCCwoKCTgDDQgICgc4BAoJOAULCAsHOAYLCTgHAgA="
];

const PACKAGE_DEPENDENCIES = [
  "0x0000000000000000000000000000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000000000000000000000000000002"
];

export type StandardTokenParams = {
  name: string;
  symbol: string;
  description: string;
  iconUrl: string;
  decimals: number;
  totalSupply: string;
};

async function publishTemplateWithKeypair(client: SuiClient, keypair: SupportedSuiKeypair) {
  const owner = keypair.toSuiAddress();
  const tx = new Transaction();
  const [upgradeCap] = tx.publish({
    modules: MODULES_BASE64.map((module) => Array.from(fromBase64(module))),
    dependencies: PACKAGE_DEPENDENCIES
  });
  tx.transferObjects([upgradeCap], tx.pure.address(owner));

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showObjectChanges: true
    }
  });

  const receipt = await client.waitForTransaction({
    digest: result.digest,
    options: {
      showObjectChanges: true
    }
  });

  const packageId = receipt.objectChanges?.find((change) => change.type === "published")?.packageId;
  if (!packageId) {
    throw new Error("Failed to locate published packageId for the token template.");
  }

  return { digest: result.digest, packageId };
}

async function publishTemplateWithWallet(
  client: SuiClient,
  walletAddress: string,
  execute: (tx: Transaction) => Promise<{ digest: string }>
) {
  const tx = new Transaction();
  const [upgradeCap] = tx.publish({
    modules: MODULES_BASE64.map((module) => Array.from(fromBase64(module))),
    dependencies: PACKAGE_DEPENDENCIES
  });
  tx.transferObjects([upgradeCap], tx.pure.address(walletAddress));

  const result = await execute(tx);
  const receipt = await client.waitForTransaction({
    digest: result.digest,
    options: {
      showObjectChanges: true
    }
  });

  const packageId = receipt.objectChanges?.find((change) => change.type === "published")?.packageId;
  if (!packageId) {
    throw new Error("Failed to locate published packageId for the token template.");
  }

  return { digest: result.digest, packageId };
}

async function initCurrencyWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  packageId: string,
  params: StandardTokenParams
) {
  const tx = createInitCurrencyTx(packageId, params);
  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true
    }
  });
}

async function initCurrencyWithWallet(
  execute: (tx: Transaction) => Promise<{ digest: string }>,
  packageId: string,
  params: StandardTokenParams
) {
  const tx = createInitCurrencyTx(packageId, params);
  return execute(tx);
}

function createInitCurrencyTx(packageId: string, params: StandardTokenParams) {
  const tx = new Transaction();
  const totalSupply = parseHumanUnits(params.totalSupply, params.decimals);

  tx.moveCall({
    target: `${packageId}::currency::init_currency`,
    arguments: [
      tx.object("0xc"),
      tx.pure.u8(params.decimals),
      tx.pure.string(params.symbol),
      tx.pure.string(params.name),
      tx.pure.string(params.description || " "),
      tx.pure.string(params.iconUrl || " "),
      tx.pure.u64(totalSupply)
    ]
  });

  return tx;
}

export async function createStandardTokenWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  params: StandardTokenParams
) {
  const { packageId, digest: publishDigest } = await publishTemplateWithKeypair(client, keypair);
  const initResult = await initCurrencyWithKeypair(client, keypair, packageId, params);

  return {
    packageId,
    publishDigest,
    initDigest: initResult.digest,
    coinType: `${packageId}::currency::COIN`
  };
}

export async function createStandardTokenWithWallet(
  client: SuiClient,
  walletAddress: string,
  execute: (tx: Transaction) => Promise<{ digest: string }>,
  params: StandardTokenParams
) {
  const { packageId, digest: publishDigest } = await publishTemplateWithWallet(
    client,
    walletAddress,
    execute
  );
  const initResult = await initCurrencyWithWallet(execute, packageId, params);

  return {
    packageId,
    publishDigest,
    initDigest: initResult.digest,
    coinType: `${packageId}::currency::COIN`
  };
}
