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

export function TransferManyToOnePage() {
  const client = useTonClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [results, setResults] = useState<TonTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  function fillSample() {
    const [destination, ...sources] = networkWallets;

    if (!destination || !sources.length) {
      return;
    }

    setDestinationAddress(destination.address);
    setSourcesText(
      sources
        .slice(0, 2)
        .map((wallet, index) => `${wallet.address},0.0${index + 1},collect-${index + 1}`)
        .join("\n")
    );
  }

  function runTransfer() {
    startTransition(async () => {
      try {
        const transfers = transferService.parseManyToOneText(sourcesText);
        const result = await transferService.manyToOne(
          client,
          network,
          networkWallets,
          destinationAddress,
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
        <MetaCard
          label="目标地址"
          value={destinationAddress ? `${destinationAddress.slice(0, 12)}...` : "未填写"}
        />
        <MetaCard label="任务行数" value={String(sourcesText.split(/\r?\n/).filter(Boolean).length)} />
        <MetaCard label="模式" value="多个钱包 -> 一个地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多转一</h2>
          <p className={styles.panelDescription}>
            先填写目标地址，再按行输入 `sourceAddress,amount,memo(可选)`。发送前会检查每个源钱包的链上余额。
          </p>
          <div className={styles.panelBody}>
            <input
              className={styles.input}
              placeholder="目标地址"
              value={destinationAddress}
              onChange={(event) => setDestinationAddress(event.target.value.trim())}
            />

            <textarea
              className={styles.textarea}
              placeholder={"每行一个: sourceAddress,amount,memo(可选)\n示例:\nUQsource1...,0.15,collect-1\nUQsource2...,0.20"}
              value={sourcesText}
              onChange={(event) => setSourcesText(event.target.value)}
            />

            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !destinationAddress || !sourcesText.trim()}
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行多转一"}
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
