import { useMemo, useState, useTransition } from "react";

import { useTonClient } from "../../hooks/use-ton-client";
import { transferService } from "../../lib/transfer/transfer-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { TonTransferBatchResult } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferResultPanel } from "./transfer-result-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferOneToManyPage() {
  const client = useTonClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [recipientsText, setRecipientsText] = useState("");
  const [results, setResults] = useState<TonTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const sourceWallet = networkWallets.find((wallet) => wallet.id === sourceWalletId);
  const taskCount = recipientsText.split(/\r?\n/).filter(Boolean).length;

  function fillSample() {
    if (!networkWallets.length) {
      return;
    }

    const targets = networkWallets.filter((wallet) => wallet.id !== sourceWalletId).slice(0, 2);

    if (!targets.length) {
      return;
    }

    setRecipientsText(
      targets
        .map((wallet, index) => `${wallet.address},0.0${index + 1},sample-${index + 1}`)
        .join("\n")
    );
  }

  function runTransfer() {
    startTransition(async () => {
      try {
        if (!sourceWallet) {
          throw new Error("请选择一个源钱包。");
        }

        const recipients = transferService.parseRecipientsText(recipientsText);
        const result = await transferService.oneToMany(
          client,
          network,
          sourceWallet,
          recipients,
          appendLog
        );
        setResults(result);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前网络钱包" value={String(networkWallets.length)} />
        <MetaCard label="当前源钱包" value={sourceWallet ? sourceWallet.label : "未选择"} />
        <MetaCard label="任务行数" value={String(taskCount)} />
        <MetaCard label="模式" value="一个钱包 -> 多个地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>一转多</h2>
          <p className={styles.panelDescription}>
            每行格式为 `address,amount,memo(可选)`。发送前会自动检查源钱包余额，预留一部分手续费空间。
          </p>
          <div className={styles.panelBody}>
            <select
              className={styles.select}
              value={sourceWalletId}
              onChange={(event) => setSourceWalletId(event.target.value)}
            >
              <option value="">选择源钱包</option>
              {networkWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.address.slice(0, 10)}...
                </option>
              ))}
            </select>

            <textarea
              className={styles.textarea}
              placeholder={"每行一个: address,amount,memo(可选)\n示例:\nUQ....,0.05,airdrop-01\nUQ....,0.12"}
              value={recipientsText}
              onChange={(event) => setRecipientsText(event.target.value)}
            />

            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !sourceWalletId || !recipientsText.trim()}
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行一转多"}
              </button>
              <button
                className={styles.buttonGhost}
                disabled={isPending || networkWallets.length < 2}
                onClick={fillSample}
              >
                填充示例
              </button>
            </div>

            <TransferResultPanel result={results} />
          </div>
        </article>

        <TransferLogsPanel logs={logs} />
      </div>

      <TransferWalletPanel />
    </section>
  );
}

function MetaCard(props: { label: string; value: string }) {
  return (
    <div className={styles.metaCard}>
      <div className={styles.metaLabel}>{props.label}</div>
      <div className={styles.metaValue}>{props.value}</div>
    </div>
  );
}
