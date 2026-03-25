import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
import { isValidSuiAddress } from "@mysten/sui/utils";

export type LocalWallet = {
  index: number;
  address: string;
  privateKey: string;
  scheme: "ED25519" | "Secp256k1" | "Secp256r1";
};

export type SupportedSuiKeypair = Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;

export function walletFromPrivateKey(privateKey: string) {
  const decoded = decodeSuiPrivateKey(privateKey.trim());

  if (decoded.scheme === "ED25519") {
    const keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
    return { scheme: decoded.scheme, keypair, address: keypair.toSuiAddress() };
  }

  if (decoded.scheme === "Secp256k1") {
    const keypair = Secp256k1Keypair.fromSecretKey(decoded.secretKey);
    return { scheme: decoded.scheme, keypair, address: keypair.toSuiAddress() };
  }

  if (decoded.scheme === "Secp256r1") {
    const keypair = Secp256r1Keypair.fromSecretKey(decoded.secretKey);
    return { scheme: decoded.scheme, keypair, address: keypair.toSuiAddress() };
  }

  throw new Error(`Unsupported Sui private key scheme: ${decoded.scheme}`);
}

export function generateWallets(count: number) {
  const wallets: LocalWallet[] = [];

  for (let index = 0; index < count; index += 1) {
    const keypair = Ed25519Keypair.generate();
    wallets.push({
      index: index + 1,
      address: keypair.toSuiAddress(),
      privateKey: keypair.getSecretKey(),
      scheme: "ED25519"
    });
  }

  return wallets;
}

export function validateWalletCount(count: number) {
  return Number.isFinite(count) && count > 0 && count <= 5000;
}

export function assertSuiAddress(address: string) {
  if (!isValidSuiAddress(address.trim())) {
    throw new Error(`Invalid Sui address: ${address}`);
  }
}
