import { TronWeb } from "tronweb";

import { balanceService } from "../balance/balance-service";
import {
  getExplorerAddressUrl,
  getExplorerTransactionUrl,
  createTronWeb
} from "../tron/client";
import { defaultFeeLimitSun, trxReserveSun } from "../tron/constants";
import { walletService } from "../wallet/wallet-service";
import type { BatchTaskLog } from "../../types/task";
import type { TronNetwork } from "../../types/network";
import type {
  ManyToManyTransferInput,
  ManyToOneTransferInput,
  RelayTransferInput,
  TransferAssetInput,
  TransferRecipientInput,
  TronTransferBatchResult,
  TronTransferReceipt
} from "../../types/transfer";
import type { TronWalletRecord } from "../../types/wallet";

type TaskLogger = (log: BatchTaskLog) => void;

export const transferService = {
  parseRecipientsText(text: string) {
    return parseLines(text, (line, index) => {
      const [address, amount, memo] = splitCsvLine(line);
      ensureAddress(address, index);
      ensureAmount(amount, index);
      return { address, amount, memo } satisfies TransferRecipientInput;
    });
  },

  parseManyToOneText(text: string) {
    return parseLines(text, (line, index) => {
      const [sourceAddress, amount, memo] = splitCsvLine(line);
      ensureAddress(sourceAddress, index);
      ensureAmount(amount, index);
      return { sourceAddress, amount, memo } satisfies ManyToOneTransferInput;
    });
  },

  parseManyToManyText(text: string) {
    return parseLines(text, (line, index) => {
      const [sourceAddress, destinationAddress, amount, memo] = splitCsvLine(line);
      ensureAddress(sourceAddress, index);
      ensureAddress(destinationAddress, index);
      ensureAmount(amount, index);
      return {
        sourceAddress,
        destinationAddress,
        amount,
        memo
      } satisfies ManyToManyTransferInput;
    });
  },

  async oneToMany(
    tronWeb: TronWeb,
    network: TronNetwork,
    sourceWallet: TronWalletRecord,
    recipients: TransferRecipientInput[],
    asset: TransferAssetInput,
    onLog?: TaskLogger
  ) {
    const items: TronTransferReceipt[] = [];

    for (const recipient of recipients) {
      items.push(
        await sendSingleTransfer(tronWeb, network, {
          sourceWallet,
          destinationAddress: recipient.address,
          amount: recipient.amount,
          memo: recipient.memo,
          asset,
          onLog
        })
      );
    }

    return summarizeBatch("one-to-many", network, asset, items);
  },

  async manyToOne(
    tronWeb: TronWeb,
    network: TronNetwork,
    wallets: TronWalletRecord[],
    destinationAddress: string,
    transfers: ManyToOneTransferInput[],
    asset: TransferAssetInput,
    onLog?: TaskLogger
  ) {
    ensureAddress(destinationAddress, 0);

    const items: TronTransferReceipt[] = [];

    for (const item of transfers) {
      const sourceWallet = walletService.findWalletByAddress(wallets, item.sourceAddress);

      if (!sourceWallet) {
        throw new Error(`本地钱包仓库中不存在地址 ${item.sourceAddress}`);
      }

      items.push(
        await sendSingleTransfer(tronWeb, network, {
          sourceWallet,
          destinationAddress,
          amount: item.amount,
          memo: item.memo,
          asset,
          onLog
        })
      );
    }

    return summarizeBatch("many-to-one", network, asset, items);
  },

  async manyToMany(
    tronWeb: TronWeb,
    network: TronNetwork,
    wallets: TronWalletRecord[],
    transfers: ManyToManyTransferInput[],
    asset: TransferAssetInput,
    onLog?: TaskLogger
  ) {
    const items: TronTransferReceipt[] = [];

    for (const item of transfers) {
      const sourceWallet = walletService.findWalletByAddress(wallets, item.sourceAddress);

      if (!sourceWallet) {
        throw new Error(`本地钱包仓库中不存在地址 ${item.sourceAddress}`);
      }

      items.push(
        await sendSingleTransfer(tronWeb, network, {
          sourceWallet,
          destinationAddress: item.destinationAddress,
          amount: item.amount,
          memo: item.memo,
          asset,
          onLog
        })
      );
    }

    return summarizeBatch("many-to-many", network, asset, items);
  },

  async relay(
    tronWeb: TronWeb,
    network: TronNetwork,
    wallets: TronWalletRecord[],
    input: RelayTransferInput,
    asset: TransferAssetInput,
    onLog?: TaskLogger
  ) {
    const sourceWallet = walletService.findWalletByAddress(wallets, input.sourceAddress);
    const relayWallet = walletService.findWalletByAddress(wallets, input.relayAddress);

    if (!sourceWallet) {
      throw new Error("未找到源钱包，请先在本地仓库中创建或导入。");
    }

    if (!relayWallet) {
      throw new Error("未找到中转钱包，请先在本地仓库中创建或导入。");
    }

    const first = await sendSingleTransfer(tronWeb, network, {
      sourceWallet,
      destinationAddress: input.relayAddress,
      amount: input.sourceToRelayAmount,
      memo: input.sourceMemo,
      asset,
      onLog
    });

    const second = await sendSingleTransfer(tronWeb, network, {
      sourceWallet: relayWallet,
      destinationAddress: input.destinationAddress,
      amount: input.relayToDestinationAmount,
      memo: input.relayMemo,
      asset,
      onLog
    });

    return summarizeBatch("relay", network, asset, [first, second]);
  },

  explorerAddressUrl(network: TronNetwork, address: string) {
    return getExplorerAddressUrl(network, address);
  }
};

async function sendSingleTransfer(
  tronWeb: TronWeb,
  network: TronNetwork,
  args: {
    sourceWallet: TronWalletRecord;
    destinationAddress: string;
    amount: string;
    memo?: string;
    asset: TransferAssetInput;
    onLog?: TaskLogger;
  }
) {
  const signedClient = createTronWeb(network, args.sourceWallet.privateKey);
  ensureAddress(args.destinationAddress, 0);

  if (args.asset.kind === "trx") {
    const trxBalance = await tronWeb.trx.getBalance(args.sourceWallet.addressBase58);
    const amountSun = toSun(args.amount);

    if (trxBalance < amountSun + trxReserveSun) {
      throw new Error(
        `${shortAddress(args.sourceWallet.addressBase58)} 的 TRX 余额不足。当前余额 ${tronWeb.fromSun(trxBalance)} TRX。`
      );
    }

    args.onLog?.(
      createLog(
        "info",
        `${shortAddress(args.sourceWallet.addressBase58)} -> ${shortAddress(args.destinationAddress)} 发送 ${args.amount} TRX`
      )
    );

    let transaction = await signedClient.transactionBuilder.sendTrx(
      args.destinationAddress,
      amountSun,
      args.sourceWallet.addressBase58
    );

    if (args.memo?.trim()) {
      transaction = await signedClient.transactionBuilder.addUpdateData(
        transaction,
        args.memo.trim(),
        "utf8"
      );
    }

    const signed = await signedClient.trx.sign(transaction, args.sourceWallet.privateKey);
    const broadcast = await signedClient.trx.sendRawTransaction(signed);
    const txId = broadcast.txid || transaction.txID;

    return buildReceipt(network, args, txId);
  }

  if (!args.asset.contractAddress) {
    throw new Error("TRC20 转账需要填写合约地址。");
  }

  const trxBalance = await tronWeb.trx.getBalance(args.sourceWallet.addressBase58);

  if (trxBalance < trxReserveSun) {
    throw new Error(
      `${shortAddress(args.sourceWallet.addressBase58)} 的 TRX 余额不足以支付合约调用手续费。`
    );
  }

  const contract = await signedClient
    .contract(balanceService.trc20Abi, args.asset.contractAddress)
    .at(args.asset.contractAddress);
  const decimals = Number(await contract.decimals().call());
  const rawAmount = toTokenRawAmount(args.amount, decimals);
  const rawBalance = BigInt(
    (
      await contract.balanceOf(args.sourceWallet.addressBase58).call({
        feeLimit: defaultFeeLimitSun
      })
    ).toString()
  );

  if (rawBalance < rawAmount) {
    throw new Error(
      `${shortAddress(args.sourceWallet.addressBase58)} 的代币余额不足，当前余额 ${rawBalance.toString()}。`
    );
  }

  args.onLog?.(
    createLog(
      "info",
      `${shortAddress(args.sourceWallet.addressBase58)} -> ${shortAddress(args.destinationAddress)} 发送 ${args.amount} TRC20`
    )
  );

  const txId = await contract.transfer(args.destinationAddress, rawAmount).send(
    {
      feeLimit: defaultFeeLimitSun,
      shouldPollResponse: false
    },
    args.sourceWallet.privateKey
  );

  return buildReceipt(network, args, txId);
}

function buildReceipt(
  network: TronNetwork,
  args: {
    sourceWallet: TronWalletRecord;
    destinationAddress: string;
    amount: string;
    memo?: string;
    asset: TransferAssetInput;
  },
  txId: string
) {
  return {
    sourceAddress: args.sourceWallet.addressBase58,
    destinationAddress: walletService.normalizeAddress(args.destinationAddress),
    amount: args.amount,
    memo: args.memo,
    assetKind: args.asset.kind,
    contractAddress: args.asset.contractAddress,
    txId,
    sourceExplorerUrl: getExplorerAddressUrl(network, args.sourceWallet.addressBase58),
    destinationExplorerUrl: getExplorerAddressUrl(network, args.destinationAddress),
    transactionExplorerUrl: getExplorerTransactionUrl(network, txId)
  } satisfies TronTransferReceipt;
}

function summarizeBatch(
  mode: TronTransferBatchResult["mode"],
  network: TronNetwork,
  asset: TransferAssetInput,
  items: TronTransferReceipt[]
) {
  return {
    mode,
    network,
    asset,
    total: items.length,
    successCount: items.length,
    items
  } satisfies TronTransferBatchResult;
}

function parseLines<T>(text: string, mapper: (line: string, index: number) => T) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("请输入至少一行任务数据。");
  }

  return lines.map(mapper);
}

function splitCsvLine(line: string) {
  return line.split(",").map((item) => item.trim());
}

function ensureAddress(value: string | undefined, index: number) {
  if (!value || !TronWeb.isAddress(value)) {
    throw new Error(`第 ${index + 1} 行地址无效。`);
  }
}

function ensureAmount(value: string | undefined, index: number) {
  if (!value) {
    throw new Error(`第 ${index + 1} 行缺少金额。`);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`第 ${index + 1} 行金额无效：${value}`);
  }
}

function toSun(amount: string) {
  return Math.round(Number(amount) * 1_000_000);
}

function toTokenRawAmount(amount: string, decimals: number) {
  const [wholePart, fractionPart = ""] = amount.split(".");
  const normalizedFraction = fractionPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(`${wholePart}${normalizedFraction || ""}`);
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function createLog(level: BatchTaskLog["level"], message: string) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message
  } satisfies BatchTaskLog;
}
