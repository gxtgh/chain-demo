import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { Address, fromNano, WalletContractV4 } from "@ton/ton";

import type { TonNetwork } from "../../types/network";
import type { TonWalletRecord, WalletBalanceSnapshot } from "../../types/wallet";

export const walletService = {
  async generateWallets(count: number, network: TonNetwork) {
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      throw new Error("一次最多创建 1 到 100 个钱包。");
    }

    const generated: TonWalletRecord[] = [];

    for (let index = 0; index < count; index += 1) {
      const mnemonic = await mnemonicNew(24);
      const keyPair = await mnemonicToPrivateKey(mnemonic);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
      });
      const address = wallet.address.toString({
        testOnly: network === "testnet"
      });

      generated.push({
        id: crypto.randomUUID(),
        label: `TON Wallet ${String(index + 1).padStart(2, "0")}`,
        address,
        rawAddress: wallet.address.toRawString(),
        publicKey: Buffer.from(keyPair.publicKey).toString("hex"),
        mnemonic,
        createdAt: new Date().toISOString(),
        network,
        version: "v4R2"
      });
    }

    return generated;
  },

  normalizeAddress(address: string) {
    return Address.parse(address.trim()).toRawString();
  },

  async importWallets(jsonText: string, fallbackNetwork: TonNetwork) {
    const parsed = JSON.parse(jsonText) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("导入文件格式错误，需要是钱包数组。");
    }

    const imported: TonWalletRecord[] = [];

    for (const [index, item] of parsed.entries()) {
      if (!item || typeof item !== "object") {
        throw new Error(`第 ${index + 1} 条钱包记录格式无效。`);
      }

      const record = item as Partial<TonWalletRecord>;
      const mnemonic = Array.isArray(record.mnemonic)
        ? record.mnemonic.map((word) => String(word).trim()).filter(Boolean)
        : [];

      if (mnemonic.length !== 24) {
        throw new Error(`第 ${index + 1} 条钱包记录缺少有效的 24 个助记词。`);
      }

      const network = record.network === "mainnet" || record.network === "testnet"
        ? record.network
        : fallbackNetwork;

      const keyPair = await mnemonicToPrivateKey(mnemonic);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
      });
      const address = wallet.address.toString({
        testOnly: network === "testnet"
      });

      imported.push({
        id: record.id || crypto.randomUUID(),
        label: record.label?.trim() || `Imported Wallet ${String(index + 1).padStart(2, "0")}`,
        address,
        rawAddress: wallet.address.toRawString(),
        publicKey: Buffer.from(keyPair.publicKey).toString("hex"),
        mnemonic,
        createdAt: record.createdAt || new Date().toISOString(),
        network,
        version: "v4R2"
      });
    }

    return imported;
  },

  exportWallets(wallets: TonWalletRecord[]) {
    return JSON.stringify(wallets, null, 2);
  },

  findWalletByAddress(wallets: TonWalletRecord[], address: string) {
    const rawAddress = walletService.normalizeAddress(address);
    return wallets.find((wallet) => wallet.rawAddress === rawAddress);
  },

  async getBalance(
    client: { getBalance: (address: Address) => Promise<bigint> },
    address: string
  ) {
    const balanceNano = await client.getBalance(Address.parse(address));

    return {
      address,
      balanceNano: balanceNano.toString(),
      balanceTon: fromNano(balanceNano)
    } satisfies WalletBalanceSnapshot;
  },

  async getBalances(
    client: { getBalance: (address: Address) => Promise<bigint> },
    wallets: TonWalletRecord[]
  ) {
    const items: WalletBalanceSnapshot[] = [];

    for (const wallet of wallets) {
      const balanceNano = await client.getBalance(Address.parse(wallet.address));

      items.push({
        address: wallet.address,
        balanceNano: balanceNano.toString(),
        balanceTon: fromNano(balanceNano)
      });
    }

    return items;
  }
};
