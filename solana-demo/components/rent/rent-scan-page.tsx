import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { rentService } from "../../lib/rent/rent-service";
import { useWalletStore } from "../../store/wallet-store";
import { WalletRepositoryPanel } from "../wallet/wallet-repository-panel";
import type { RentScanResult } from "../../types/rent";
import styles from "./rent-shell.module.scss";
import { RentLogsPanel } from "./rent-logs-panel";
import { useRentTaskLogs } from "./use-rent-task-logs";

export function RentScanPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [results, setResults] = useState<RentScanResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useRentTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  const totalRecoverableLamports = results.reduce(
    (sum, item) => sum + item.recoverableLamports,
    0
  );

  function runScan() {
    startTransition(async () => {
      try {
        const result = await rentService.scanForWallets(connection, selectedWallets, appendLog);
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
        <MetaCard label="可回收 lamports" value={String(totalRecoverableLamports)} />
        <MetaCard label="可回收 SOL" value={(totalRecoverableLamports / 1_000_000_000).toFixed(6)} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>扫描与预估</h2>
          <p className={styles.panelDescription}>
            扫描选中钱包下的空 SPL Token 账户，估算理论上可回收的租金总额。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isPending || selectedWallets.length === 0}
                onClick={runScan}
              >
                {isPending ? "扫描中..." : "开始扫描"}
              </button>
            </div>
            {results.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有扫描结果。</div>
            )}
          </div>
        </article>

        <RentLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel />
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

