import { Keypair } from "@solana/web3.js";

import { DEMO_SECRET_PASSPHRASE } from "../solana/constants";
import { createLocalWalletRecord, restoreKeypairFromSecret } from "./keypair-storage";
import type { LocalWalletRecord } from "../../types/wallet";

const csvHeader = [
  "id",
  "label",
  "publicKey",
  "secretKeyBase58",
  "encryptedSecretKey",
  "createdAt",
  "origin"
];

export function exportWalletsToJson(wallets: LocalWalletRecord[]): string {
  return JSON.stringify(wallets, null, 2);
}

export function exportWalletsToCsv(wallets: LocalWalletRecord[]): string {
  const lines = wallets.map((wallet) =>
    [
      wallet.id,
      escapeCsv(wallet.label),
      wallet.publicKey,
      wallet.secretKeyBase58,
      wallet.encryptedSecretKey,
      wallet.createdAt,
      wallet.origin
    ].join(",")
  );

  return [csvHeader.join(","), ...lines].join("\n");
}

export function importWalletsFromJson(text: string): LocalWalletRecord[] {
  const parsed = JSON.parse(text) as Array<Partial<LocalWalletRecord>>;

  return parsed
    .filter((item) => item.publicKey && (item.secretKeyBase58 || item.encryptedSecretKey))
    .map((item, index) => {
      const keypair = restoreKeypairFromSecret(
        item.encryptedSecretKey ?? item.secretKeyBase58 ?? "",
        DEMO_SECRET_PASSPHRASE
      );

      return createLocalWalletRecord(keypair, DEMO_SECRET_PASSPHRASE, {
        label: item.label ?? `Imported ${index + 1}`,
        origin: "imported"
      });
    });
}

export function importWalletsFromCsv(text: string): LocalWalletRecord[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    const [id, label, publicKey, secretKeyBase58, encryptedSecretKey] = splitCsvLine(line);

    const keypair = restoreKeypairFromSecret(
      encryptedSecretKey || secretKeyBase58,
      DEMO_SECRET_PASSPHRASE
    );

    const wallet = createLocalWalletRecord(keypair, DEMO_SECRET_PASSPHRASE, {
      label: label || `Imported ${index + 1}`,
      origin: "imported"
    });

    return {
      ...wallet,
      id: id || wallet.id,
      publicKey: publicKey || wallet.publicKey
    };
  });
}

export function triggerTextDownload(
  filename: string,
  content: string,
  contentType: string
): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedWalletText(text: string, kind: "json" | "csv"): LocalWalletRecord[] {
  return kind === "json" ? importWalletsFromJson(text) : importWalletsFromCsv(text);
}

export function createGeneratedWallets(count: number): LocalWalletRecord[] {
  return Array.from({ length: count }, (_, index) =>
    createLocalWalletRecord(Keypair.generate(), DEMO_SECRET_PASSPHRASE, {
      label: `Generated ${index + 1}`,
      origin: "generated"
    })
  );
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}
