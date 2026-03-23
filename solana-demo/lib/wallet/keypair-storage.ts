import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

import { demoEncryptSecret, demoDecryptSecret } from "./secret-crypto";
import type { LocalWalletRecord, WalletOrigin } from "../../types/wallet";

export function createLocalWalletRecord(
  keypair: Keypair,
  passphrase: string,
  options?: {
    label?: string;
    origin?: WalletOrigin;
  }
): LocalWalletRecord {
  const secretKeyBase58 = bs58.encode(keypair.secretKey);
  const publicKey = keypair.publicKey.toBase58();

  return {
    id: createWalletId(publicKey),
    label: options?.label ?? `Wallet ${publicKey.slice(0, 4)}`,
    publicKey,
    secretKeyBase58,
    encryptedSecretKey: demoEncryptSecret(secretKeyBase58, passphrase),
    createdAt: new Date().toISOString(),
    origin: options?.origin ?? "generated"
  };
}

export function restoreKeypairFromSecret(
  secret: string,
  passphrase: string
): Keypair {
  const normalizedSecret = secret.startsWith("demo:")
    ? demoDecryptSecret(secret, passphrase)
    : secret;

  return Keypair.fromSecretKey(bs58.decode(normalizedSecret));
}

function createWalletId(publicKey: string): string {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `wallet-${publicKey.slice(0, 6)}-${randomPart}`;
}
