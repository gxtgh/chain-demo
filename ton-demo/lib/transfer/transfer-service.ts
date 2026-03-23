import { mnemonicToPrivateKey } from "@ton/crypto";
import type { OpenedContract } from "@ton/core";
import {
  Address,
  SendMode,
  TonClient,
  WalletContractV4,
  fromNano,
  internal,
  toNano
} from "@ton/ton";

import { tonExplorerBaseUrl, tonTransferReserveTon } from "../ton/constants";
import { walletService } from "../wallet/wallet-service";
import type { BatchTaskLog } from "../../types/task";
import type { TonNetwork } from "../../types/network";
import type {
  ManyToManyTransferInput,
  ManyToOneTransferInput,
  RelayTransferInput,
  TonTransferBatchResult,
  TonTransferReceipt,
  TonTransferRecipientInput
} from "../../types/transfer";
import type { TonWalletRecord } from "../../types/wallet";

type TaskLogger = (log: BatchTaskLog) => void;

export const transferService = {
  parseRecipientsText(text: string) {
    return parseLines(text, (line, index) => {
      const [address, amount, memo] = splitCsvLine(line);
      ensureAddress(address, index);
      ensureAmount(amount, index);
      return { address, amount, memo } satisfies TonTransferRecipientInput;
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
    client: Pick<TonClient, "open" | "getBalance">,
    network: TonNetwork,
    sourceWallet: TonWalletRecord,
    recipients: TonTransferRecipientInput[],
    onLog?: TaskLogger
  ) {
    onLog?.(createLog("info", `开始执行一转多，共 ${recipients.length} 笔消息。`));

    const keyPair = await mnemonicToPrivateKey(sourceWallet.mnemonic);
    const walletContract = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey
    });
    const opened = client.open(walletContract);
    const seqno = await opened.getSeqno();
    const totalAmount = sumTonAmounts(recipients.map((item) => item.amount));

    await ensureWalletHasBalance(client, sourceWallet.address, totalAmount, onLog);

    await opened.sendTransfer({
      secretKey: keyPair.secretKey,
      seqno,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      messages: recipients.map((item) =>
        internal({
          to: Address.parse(item.address),
          value: toNano(item.amount),
          bounce: false,
          body: item.memo
        })
      )
    });

    const confirmedSeqno = await waitForSeqno(opened, seqno);

    return {
      mode: "one-to-many",
      network,
      total: recipients.length,
      successCount: recipients.length,
      items: recipients.map((item) => ({
        sourceAddress: sourceWallet.address,
        destinationAddress: normalizeFriendlyAddress(item.address, network),
        amount: item.amount,
        memo: item.memo,
        seqno,
        confirmedSeqno,
        sourceExplorerUrl: explorerAddressUrl(network, sourceWallet.address),
        destinationExplorerUrl: explorerAddressUrl(network, item.address)
      }))
    } satisfies TonTransferBatchResult;
  },

  async manyToOne(
    client: Pick<TonClient, "open" | "getBalance">,
    network: TonNetwork,
    wallets: TonWalletRecord[],
    destinationAddress: string,
    transfers: ManyToOneTransferInput[],
    onLog?: TaskLogger
  ) {
    ensureAddress(destinationAddress, 0);
    const items: TonTransferReceipt[] = [];

    for (const item of transfers) {
      const sourceWallet = walletService.findWalletByAddress(wallets, item.sourceAddress);

      if (!sourceWallet) {
        throw new Error(`本地钱包仓库中不存在地址 ${item.sourceAddress}`);
      }

      items.push(
        await sendSingleTransfer(client, network, {
          sourceWallet,
          destinationAddress,
          amount: item.amount,
          memo: item.memo,
          onLog
        })
      );
    }

    return summarizeBatch("many-to-one", network, items);
  },

  async manyToMany(
    client: Pick<TonClient, "open" | "getBalance">,
    network: TonNetwork,
    wallets: TonWalletRecord[],
    transfers: ManyToManyTransferInput[],
    onLog?: TaskLogger
  ) {
    const items: TonTransferReceipt[] = [];

    for (const item of transfers) {
      const sourceWallet = walletService.findWalletByAddress(wallets, item.sourceAddress);

      if (!sourceWallet) {
        throw new Error(`本地钱包仓库中不存在地址 ${item.sourceAddress}`);
      }

      items.push(
        await sendSingleTransfer(client, network, {
          sourceWallet,
          destinationAddress: item.destinationAddress,
          amount: item.amount,
          memo: item.memo,
          onLog
        })
      );
    }

    return summarizeBatch("many-to-many", network, items);
  },

  async relay(
    client: Pick<TonClient, "open" | "getBalance">,
    network: TonNetwork,
    wallets: TonWalletRecord[],
    input: RelayTransferInput,
    onLog?: TaskLogger
  ) {
    ensureAddress(input.destinationAddress, 0);
    ensureAmount(input.sourceToRelayAmount, 0);
    ensureAmount(input.relayToDestinationAmount, 0);

    const sourceWallet = walletService.findWalletByAddress(wallets, input.sourceAddress);
    const relayWallet = walletService.findWalletByAddress(wallets, input.relayAddress);

    if (!sourceWallet) {
      throw new Error("未找到源钱包，请先在本地仓库创建或导入。");
    }

    if (!relayWallet) {
      throw new Error("未找到中转钱包，请先在本地仓库创建或导入。");
    }

    const firstLeg = await sendSingleTransfer(client, network, {
      sourceWallet,
      destinationAddress: input.relayAddress,
      amount: input.sourceToRelayAmount,
      memo: input.sourceMemo,
      onLog
    });

    onLog?.(createLog("info", "等待中转钱包余额更新后继续第二段转账。"));
    await waitForBalance(
      client,
      input.relayAddress,
      addTonAmounts(input.relayToDestinationAmount, tonTransferReserveTon)
    );

    const secondLeg = await sendSingleTransfer(client, network, {
      sourceWallet: relayWallet,
      destinationAddress: input.destinationAddress,
      amount: input.relayToDestinationAmount,
      memo: input.relayMemo,
      onLog
    });

    return summarizeBatch("relay", network, [firstLeg, secondLeg]);
  },

  async preflightBalances(
    client: Pick<TonClient, "getBalance">,
    wallets: TonWalletRecord[],
    transfers: Array<{ sourceAddress: string; amount: string }>
  ) {
    const grouped = new Map<string, string>();

    for (const item of transfers) {
      const sourceWallet = walletService.findWalletByAddress(wallets, item.sourceAddress);

      if (!sourceWallet) {
        throw new Error(`本地钱包仓库中不存在地址 ${item.sourceAddress}`);
      }

      const current = grouped.get(sourceWallet.address) ?? "0";
      grouped.set(sourceWallet.address, addTonAmounts(current, item.amount));
    }

    const checks = [];

    for (const [address, amount] of grouped.entries()) {
      const balance = await walletService.getBalance(client, address);
      const required = addTonAmounts(amount, tonTransferReserveTon);
      const sufficient = toNano(balance.balanceTon) >= toNano(required);

      checks.push({
        address,
        balanceTon: balance.balanceTon,
        requiredTon: required,
        sufficient
      });
    }

    return checks;
  },

  explorerAddressUrl(network: TonNetwork, address: string) {
    return explorerAddressUrl(network, address);
  }
};

function parseLines<T>(text: string, mapper: (line: string, index: number) => T) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("请输入至少一行转账数据。");
  }

  return lines.map(mapper);
}

function splitCsvLine(line: string) {
  return line.split(",").map((item) => item.trim());
}

function ensureAddress(value: string | undefined, index: number) {
  if (!value) {
    throw new Error(`第 ${index + 1} 行缺少地址。`);
  }

  Address.parse(value);
}

function ensureAmount(value: string | undefined, index: number) {
  if (!value) {
    throw new Error(`第 ${index + 1} 行缺少金额。`);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`第 ${index + 1} 行金额无效：${value}`);
  }

  toNano(value);
}

function createLog(level: BatchTaskLog["level"], message: string) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message
  } satisfies BatchTaskLog;
}

async function sendSingleTransfer(
  client: Pick<TonClient, "open" | "getBalance">,
  network: TonNetwork,
  args: {
    sourceWallet: TonWalletRecord;
    destinationAddress: string;
    amount: string;
    memo?: string;
    onLog?: TaskLogger;
  }
) {
  const keyPair = await mnemonicToPrivateKey(args.sourceWallet.mnemonic);
  const walletContract = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey
  });
  const opened = client.open(walletContract);
  const seqno = await opened.getSeqno();

  await ensureWalletHasBalance(client, args.sourceWallet.address, args.amount, args.onLog);

  args.onLog?.(
    createLog(
      "info",
      `${shortAddress(args.sourceWallet.address)} -> ${shortAddress(args.destinationAddress)} 发送 ${args.amount} TON`
    )
  );

  await opened.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    sendMode: SendMode.PAY_GAS_SEPARATELY,
    messages: [
      internal({
        to: Address.parse(args.destinationAddress),
        value: toNano(args.amount),
        bounce: false,
        body: args.memo
      })
    ]
  });

  const confirmedSeqno = await waitForSeqno(opened, seqno);

  args.onLog?.(
    createLog(
      "info",
      `交易已确认，Seqno ${seqno} -> ${confirmedSeqno}，可继续在浏览器或链上确认到账。`
    )
  );

  return {
    sourceAddress: args.sourceWallet.address,
    destinationAddress: normalizeFriendlyAddress(args.destinationAddress, network),
    amount: args.amount,
    memo: args.memo,
    seqno,
    confirmedSeqno,
    sourceExplorerUrl: explorerAddressUrl(network, args.sourceWallet.address),
    destinationExplorerUrl: explorerAddressUrl(network, args.destinationAddress)
  } satisfies TonTransferReceipt;
}

function summarizeBatch(
  mode: TonTransferBatchResult["mode"],
  network: TonNetwork,
  items: TonTransferReceipt[]
) {
  return {
    mode,
    network,
    total: items.length,
    successCount: items.length,
    items
  } satisfies TonTransferBatchResult;
}

async function waitForSeqno(
  contract: OpenedContract<WalletContractV4>,
  previousSeqno: number,
  maxAttempts = 20
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(1500);
    const nextSeqno = await contract.getSeqno();

    if (nextSeqno > previousSeqno) {
      return nextSeqno;
    }
  }

  throw new Error("交易已发送，但在预期时间内未观察到 seqno 递增。");
}

async function waitForBalance(
  client: Pick<TonClient, "open" | "getBalance">,
  address: string,
  minimumAmountTon: string,
  maxAttempts = 15
) {
  const minimumAmount = toNano(minimumAmountTon);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(2000);
    const balance = await client.getBalance(Address.parse(address));

    if (balance >= minimumAmount) {
      return {
        balanceNano: balance.toString(),
        balanceTon: fromNano(balance)
      };
    }
  }

  throw new Error("等待中转钱包入账超时，请确认第一段转账是否到账。");
}

async function ensureWalletHasBalance(
  client: Pick<TonClient, "getBalance">,
  address: string,
  amountTon: string,
  onLog?: TaskLogger
) {
  const balance = await walletService.getBalance(client, address);
  const requiredTon = addTonAmounts(amountTon, tonTransferReserveTon);

  onLog?.(
    createLog(
      "info",
      `${shortAddress(address)} 余额 ${balance.balanceTon} TON，当前任务至少需要 ${requiredTon} TON。`
    )
  );

  if (toNano(balance.balanceTon) < toNano(requiredTon)) {
    throw new Error(
      `${shortAddress(address)} 余额不足。当前余额 ${balance.balanceTon} TON，至少需要 ${requiredTon} TON（含预留手续费）。`
    );
  }
}

function normalizeFriendlyAddress(address: string, network: TonNetwork) {
  return Address.parse(address).toString({
    testOnly: network === "testnet"
  });
}

function explorerAddressUrl(network: TonNetwork, address: string) {
  return `${tonExplorerBaseUrl[network]}/${normalizeFriendlyAddress(address, network)}`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function addTonAmounts(left: string, right: string) {
  return fromNano(toNano(left) + toNano(right));
}

function sumTonAmounts(amounts: string[]) {
  return fromNano(amounts.reduce((sum, item) => sum + toNano(item), 0n));
}

function sleep(duration: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}
