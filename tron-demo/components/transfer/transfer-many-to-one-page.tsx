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

export function TransferManyToOnePage() {
  const tronWeb = useTronClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [destinationAddress, setDestinationAddress] = useState("");
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("trx");
  const [contractAddress, setContractAddress] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [results, setResults] = useState<TronTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  function runTransfer() {
    startTransition(async () => {
      try {
        const transfers = transferService.parseManyToOneText(sourcesText);
        const result = await transferService.manyToOne(
          tronWeb,
          network,
          networkWallets,
          destinationAddress,
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
        <MetaCard label="目标地址" value={destinationAddress ? `${destinationAddress.slice(0, 10)}...` : "未填写"} />
        <MetaCard label="任务行数" value={String(sourcesText.split(/\r?\n/).filter(Boolean).length)} />
        <MetaCard label="资产类型" value={assetKind.toUpperCase()} />
      </div>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多对一</h2>
          <p className={styles.panelDescription}>先填写目标地址，再按行输入 sourceAddress,amount,memo(可选)。</p>
          <div className={styles.panelBody}>
            <input className={styles.input} placeholder="目标地址" value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value.trim())} />
            <TransferAssetControls assetKind={assetKind} contractAddress={contractAddress} onAssetKindChange={setAssetKind} onContractAddressChange={setContractAddress} />
            <textarea className={styles.textarea} placeholder={"每行一个: sourceAddress,amount,memo(可选)\n示例:\nTxxx...,1.2,collect-1"} value={sourcesText} onChange={(event) => setSourcesText(event.target.value)} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !destinationAddress || !sourcesText.trim()} onClick={runTransfer}>
                {isPending ? "执行中..." : "执行多对一"}
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
