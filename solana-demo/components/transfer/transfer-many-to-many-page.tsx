import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import {
  parseManyToManyText,
  transferService,
  validateTransferForm
} from "../../lib/transfer/transfer-service";
import { useWalletStore } from "../../store/wallet-store";
import type { TransferAssetKind } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferManyToManyPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("sol");
  const [mintAddress, setMintAddress] = useState("");
  const [taskText, setTaskText] = useState("");
  const [results, setResults] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const walletMap = useMemo(
    () => new Map(wallets.map((wallet) => [wallet.publicKey, wallet])),
    [wallets]
  );

  function runTransfer() {
    startTransition(async () => {
      try {
        validateTransferForm({
          asset: {
            kind: assetKind,
            mintAddress
          }
        });

        const tasks = parseManyToManyText(taskText).map((task) => {
          const wallet = walletMap.get(task.sourceAddress);

          if (!wallet) {
            throw new Error(`Source wallet ${task.sourceAddress} is not in local wallet storage.`);
          }

          return {
            ...task,
            wallet
          };
        });

        const result = await transferService.manyToMany(
          connection,
          tasks,
          {
            kind: assetKind,
            mintAddress
          },
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
        <MetaCard label="本地钱包数" value={String(wallets.length)} />
        <MetaCard label="资产" value={assetKind === "sol" ? "SOL" : "SPL Token"} />
        <MetaCard
          label="任务行数"
          value={String(taskText.split(/\r?\n/).filter(Boolean).length)}
        />
        <MetaCard label="来源要求" value="必须在本地钱包仓库中" />
        <MetaCard label="模式" value="多钱包 -> 多地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多转多</h2>
          <p className={styles.panelDescription}>通过任务文本批量指定来源钱包、目标地址和金额，支持 SOL 与指定 SPL Token。</p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <select
                className={styles.select}
                value={assetKind}
                onChange={(event) => setAssetKind(event.target.value as TransferAssetKind)}
              >
                <option value="sol">SOL</option>
                <option value="spl">SPL Token</option>
              </select>
              <input
                className={styles.input}
                placeholder="SPL Mint 地址（仅 Token 模式必填）"
                value={mintAddress}
                onChange={(event) => setMintAddress(event.target.value.trim())}
              />
            </div>
            <textarea
              className={styles.textarea}
              placeholder={"每行一个：sourceAddress,destinationAddress,amount\n例如：\n7src...,9dst...,0.01"}
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !taskText.trim() || (assetKind === "spl" && !mintAddress)}
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行多转多"}
              </button>
            </div>
            {results ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有转账结果。</div>
            )}
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
