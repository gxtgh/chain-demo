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

export function TransferManyToManyPage() {
  const client = useTonClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [matrixText, setMatrixText] = useState("");
  const [results, setResults] = useState<TonTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  function fillSample() {
    if (networkWallets.length < 2) {
      return;
    }

    const pairs = networkWallets.slice(0, 2);
    setMatrixText(
      [
        `${pairs[0].address},${pairs[1].address},0.01,batch-1`,
        `${pairs[1].address},${pairs[0].address},0.02,batch-2`
      ].join("\n")
    );
  }

  function runTransfer() {
    startTransition(async () => {
      try {
        const transfers = transferService.parseManyToManyText(matrixText);
        const result = await transferService.manyToMany(
          client,
          network,
          networkWallets,
          transfers,
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
        <MetaCard label="任务行数" value={String(matrixText.split(/\r?\n/).filter(Boolean).length)} />
        <MetaCard label="执行方式" value="逐笔签名" />
        <MetaCard label="模式" value="多个钱包 -> 多个地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多转多</h2>
          <p className={styles.panelDescription}>
            按行输入 `sourceAddress,destinationAddress,amount,memo(可选)`。这是最通用的矩阵模式，适合复杂地址分发表。
          </p>
          <div className={styles.panelBody}>
            <textarea
              className={styles.textarea}
              placeholder={"每行一个: sourceAddress,destinationAddress,amount,memo(可选)\n示例:\nUQsource...,UQtarget...,0.08,batch-a\nUQsource2...,UQtarget2...,0.12"}
              value={matrixText}
              onChange={(event) => setMatrixText(event.target.value)}
            />

            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !matrixText.trim()}
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行多转多"}
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
