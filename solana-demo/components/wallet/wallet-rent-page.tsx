import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { rentService } from "../../lib/rent/rent-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";
import type { RentRecoveryResult } from "../../types/wallet";

export function WalletRentPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [results, setResults] = useState<RentRecoveryResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useWalletTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  function runRentRecovery() {
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
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>租金回收 / 批量回收</h2>
          <p className={styles.panelDescription}>
            会扫描选中钱包下的空 SPL Token 账户，并通过 close account 指令回收租金。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isPending || selectedWallets.length === 0}
                onClick={runRentRecovery}
              >
                执行批量租金回收
              </button>
            </div>
            {results.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有租金回收结果。</div>
            )}
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel />
    </section>
  );
}
