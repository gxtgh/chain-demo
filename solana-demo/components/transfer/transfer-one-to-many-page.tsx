import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import {
  parseRecipientsText,
  transferService,
  validateTransferForm
} from "../../lib/transfer/transfer-service";
import { useWalletStore } from "../../store/wallet-store";
import type { TransferAssetKind } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferOneToManyPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("sol");
  const [mintAddress, setMintAddress] = useState("");
  const [recipientsText, setRecipientsText] = useState("");
  const [results, setResults] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const sourceWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === sourceWalletId),
    [sourceWalletId, wallets]
  );

  function runTransfer() {
    startTransition(async () => {
      try {
        if (!sourceWallet) {
          throw new Error("Please choose a source wallet.");
        }

        validateTransferForm({
          asset: {
            kind: assetKind,
            mintAddress
          },
          sourceWalletId
        });

        const recipients = parseRecipientsText(recipientsText);
        const result = await transferService.oneToMany(
          connection,
          sourceWallet,
          recipients,
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
        <MetaCard label="已选来源" value={sourceWallet ? sourceWallet.label : "未选择"} />
        <MetaCard label="资产" value={assetKind === "sol" ? "SOL" : "SPL Token"} />
        <MetaCard
          label="任务行数"
          value={String(recipientsText.split(/\r?\n/).filter(Boolean).length)}
        />
        <MetaCard label="模式" value="一钱包 -> 多地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>一转多</h2>
          <p className={styles.panelDescription}>从一个本地钱包向多个目标地址分别发起 SOL 或指定 SPL Token 转账。</p>
          <div className={styles.panelBody}>
            <select
              className={styles.select}
              value={sourceWalletId}
              onChange={(event) => setSourceWalletId(event.target.value)}
            >
              <option value="">选择来源钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
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
              placeholder={"每行一个：address,amount\n例如：\n5abc...,0.01\n8xyz...,12.5"}
              value={recipientsText}
              onChange={(event) => setRecipientsText(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !sourceWalletId || !recipientsText.trim() || (assetKind === "spl" && !mintAddress)}
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行一转多"}
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
