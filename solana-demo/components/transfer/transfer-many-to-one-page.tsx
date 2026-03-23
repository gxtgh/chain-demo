import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { transferService, validateTransferForm } from "../../lib/transfer/transfer-service";
import { useWalletStore } from "../../store/wallet-store";
import type { TransferAssetKind } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferManyToOnePage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("sol");
  const [mintAddress, setMintAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [reserveAmount, setReserveAmount] = useState("0.001");
  const [results, setResults] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  function runTransfer() {
    startTransition(async () => {
      try {
        validateTransferForm({
          asset: {
            kind: assetKind,
            mintAddress
          },
          destinationAddress,
          selectedWalletCount: selectedWallets.length
        });

        const result = await transferService.manyToOne(
          connection,
          selectedWallets,
          destinationAddress,
          reserveAmount,
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
        <MetaCard label="当前选中" value={String(selectedWallets.length)} />
        <MetaCard label="资产" value={assetKind === "sol" ? "SOL" : "SPL Token"} />
        <MetaCard label="保留数量" value={reserveAmount || "0"} />
        <MetaCard label="模式" value="多钱包 -> 一地址" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>多转一</h2>
          <p className={styles.panelDescription}>把选中的多个本地钱包中的 SOL 或指定 SPL Token 归集到一个目标地址。</p>
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
            <input
              className={styles.input}
              placeholder="目标地址"
              value={destinationAddress}
              onChange={(event) => setDestinationAddress(event.target.value.trim())}
            />
            <input
              className={styles.input}
              placeholder={assetKind === "sol" ? "每个钱包保留的 SOL，例如 0.001" : "每个钱包保留的 Token 数量，例如 1.5"}
              value={reserveAmount}
              onChange={(event) => setReserveAmount(event.target.value)}
            />
            <div className={styles.empty}>当前选中钱包数：{selectedWallets.length}</div>
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={
                  isPending ||
                  selectedWallets.length === 0 ||
                  !destinationAddress ||
                  (assetKind === "spl" && !mintAddress)
                }
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行多转一"}
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
