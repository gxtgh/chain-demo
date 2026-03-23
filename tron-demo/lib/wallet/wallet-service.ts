import { TronWeb } from "tronweb";

import type { TronNetwork } from "../../types/network";
import type { TronWalletRecord } from "../../types/wallet";

export const walletService = {
  async generateWallets(count: number, network: TronNetwork) {
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      throw new Error("一次最多创建 1 到 100 个钱包。");
    }

    const generated: TronWalletRecord[] = [];

    for (let index = 0; index < count; index += 1) {
      const account = await TronWeb.createAccount();

      generated.push({
        id: crypto.randomUUID(),
        label: `Tron Wallet ${String(index + 1).padStart(2, "0")}`,
        addressBase58: account.address.base58,
        addressHex: account.address.hex,
        publicKey: account.publicKey,
        privateKey: account.privateKey,
        createdAt: new Date().toISOString(),
        network
      });
    }

    return generated;
  },

  normalizeAddress(address: string) {
    const normalized = address.trim();

    if (!TronWeb.isAddress(normalized)) {
      throw new Error(`无效地址: ${address}`);
    }

    return TronWeb.address.fromHex(TronWeb.address.toHex(normalized));
  },

  async importWallets(jsonText: string, fallbackNetwork: TronNetwork) {
    const parsed = JSON.parse(jsonText) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("导入文件格式错误，需要是钱包数组。");
    }

    const imported: TronWalletRecord[] = [];

    for (const [index, item] of parsed.entries()) {
      if (!item || typeof item !== "object") {
        throw new Error(`第 ${index + 1} 条钱包记录格式无效。`);
      }

      const record = item as Partial<TronWalletRecord>;
      const privateKey = record.privateKey?.trim();

      if (!privateKey) {
        throw new Error(`第 ${index + 1} 条钱包记录缺少 privateKey。`);
      }

      const addressBase58 = TronWeb.address.fromPrivateKey(privateKey);

      if (!addressBase58) {
        throw new Error(`第 ${index + 1} 条钱包记录的 privateKey 无效。`);
      }

      imported.push({
        id: record.id || crypto.randomUUID(),
        label: record.label?.trim() || `Imported Wallet ${String(index + 1).padStart(2, "0")}`,
        addressBase58,
        addressHex: TronWeb.address.toHex(addressBase58),
        publicKey: record.publicKey?.trim() || "",
        privateKey,
        createdAt: record.createdAt || new Date().toISOString(),
        network:
          record.network === "mainnet" || record.network === "shasta"
            ? record.network
            : fallbackNetwork
      });
    }

    return imported;
  },

  exportWallets(wallets: TronWalletRecord[]) {
    return JSON.stringify(wallets, null, 2);
  },

  findWalletByAddress(wallets: TronWalletRecord[], address: string) {
    const normalized = walletService.normalizeAddress(address);
    return wallets.find((wallet) => wallet.addressBase58 === normalized);
  }
};
