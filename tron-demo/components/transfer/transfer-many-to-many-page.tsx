import { useMemo, useState, useTransition } from "react";

import { useTronClient } from "../../hooks/use-tron-client";
import { transferService } from "../../lib/transfer/transfer-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { TransferAssetKind, TronTransferBatchResult } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferAssetControls } from "./transfer-asset-controls";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferResultPanel } from "./transfer-result-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferManyToManyPage() {
  const tronWeb = useTronClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("trx");
  const [contractAddress, setContractAddress] = useState("");
  const [matrixText, setMatrixText] = useState("");
  const [results, setResults] = useState<TronTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  function runTransfer() {
    startTransition(async () => {
      try {
        const transfers = transferService.parseManyToManyText(matrixText);
        const result = await transferService.manyToMany(
          tronWeb,
          network,
          networkWallets,
          transfers,
          { kind: assetKind, contractAddress },
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
        <MetaCard label="执行方式" value="逐行签名" />
        <MetaCard label="资产类型" value={assetKind.toUpperCase()} />
      </div>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多对多</h2>
          <p className={styles.panelDescription}>按行输入 sourceAddress,destinationAddress,amount,memo(可选)。</p>
          <div className={styles.panelBody}>
            <TransferAssetControls assetKind={assetKind} contractAddress={contractAddress} onAssetKindChange={setAssetKind} onContractAddressChange={setContractAddress} />
            <textarea className={styles.textarea} placeholder={"每行一个: sourceAddress,destinationAddress,amount,memo(可选)\n示例:\nTsource...,Ttarget...,1.5,batch-1"} value={matrixText} onChange={(event) => setMatrixText(event.target.value)} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !matrixText.trim()} onClick={runTransfer}>
                {isPending ? "执行中..." : "执行多对多"}
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
