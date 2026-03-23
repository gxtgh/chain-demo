import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { rentService } from "../../lib/rent/rent-service";
import { useWalletStore } from "../../store/wallet-store";
import { WalletRepositoryPanel } from "../wallet/wallet-repository-panel";
import type { RentRecoveryResult } from "../../types/wallet";
import styles from "./rent-shell.module.scss";
import { RentLogsPanel } from "./rent-logs-panel";
import { useRentTaskLogs } from "./use-rent-task-logs";

export function RentRecoverPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [results, setResults] = useState<RentRecoveryResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useRentTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  const recoveredLamports = results.reduce((sum, item) => sum + item.recoveredLamports, 0);

  function runRecover() {
    startTransition(async () => {
      try {
        const result = await rentService.recoverForWallets(connection, selectedWallets, appendLog);
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
        <MetaCard label="已回收 lamports" value={String(recoveredLamports)} />
        <MetaCard label="已回收 SOL" value={(recoveredLamports / 1_000_000_000).toFixed(6)} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量租金回收</h2>
          <p className={styles.panelDescription}>
            对选中钱包执行 close account，关闭空 SPL Token 账户并把租金退回所有者钱包。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isPending || selectedWallets.length === 0}
                onClick={runRecover}
              >
                {isPending ? "回收中..." : "执行批量回收"}
              </button>
            </div>
            {results.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有回收结果。</div>
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

