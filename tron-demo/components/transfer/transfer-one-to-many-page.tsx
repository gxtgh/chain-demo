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

export function TransferOneToManyPage() {
  const tronWeb = useTronClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("trx");
  const [contractAddress, setContractAddress] = useState("");
  const [recipientsText, setRecipientsText] = useState("");
  const [results, setResults] = useState<TronTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const sourceWallet = networkWallets.find((wallet) => wallet.id === sourceWalletId);

  function runTransfer() {
    startTransition(async () => {
      try {
        if (!sourceWallet) {
          throw new Error("请选择一个源钱包。");
        }

        const recipients = transferService.parseRecipientsText(recipientsText);
        const result = await transferService.oneToMany(
          tronWeb,
          network,
          sourceWallet,
          recipients,
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
        <MetaCard label="当前源钱包" value={sourceWallet ? sourceWallet.label : "未选择"} />
        <MetaCard label="任务行数" value={String(recipientsText.split(/\r?\n/).filter(Boolean).length)} />
        <MetaCard label="资产类型" value={assetKind.toUpperCase()} />
      </div>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>一对多</h2>
          <p className={styles.panelDescription}>每行格式为 address,amount,memo(可选)。支持 TRX 与 TRC20。</p>
          <div className={styles.panelBody}>
            <select className={styles.select} value={sourceWalletId} onChange={(event) => setSourceWalletId(event.target.value)}>
              <option value="">选择源钱包</option>
              {networkWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.addressBase58.slice(0, 10)}...
                </option>
              ))}
            </select>
            <TransferAssetControls
              assetKind={assetKind}
              contractAddress={contractAddress}
              onAssetKindChange={setAssetKind}
              onContractAddressChange={setContractAddress}
            />
            <textarea className={styles.textarea} placeholder={"每行一个: address,amount,memo(可选)\n示例:\nTxxx...,1.5,airdrop-1\nTyyy...,2"} value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !sourceWalletId || !recipientsText.trim()} onClick={runTransfer}>
                {isPending ? "执行中..." : "执行一对多"}
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
