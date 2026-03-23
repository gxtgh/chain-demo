import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { walletService } from "../../lib/wallet/wallet-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";
import type { WalletMigrationResult } from "../../types/wallet";

export function WalletMigratePage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [migrationDestination, setMigrationDestination] = useState("");
  const [keepLamports, setKeepLamports] = useState(1000000);
  const [includeTokens, setIncludeTokens] = useState(true);
  const [results, setResults] = useState<WalletMigrationResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useWalletTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  function runMigration() {
    startTransition(async () => {
      try {
        const result = await walletService.migrateWallets(
          connection,
          selectedWallets,
          migrationDestination,
          {
            keepLamports,
            includeTokens,
            onLog: appendLog
          }
        );

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
          <h2 className={styles.panelTitle}>钱包资产迁移</h2>
          <p className={styles.panelDescription}>
            当前版本支持把选中钱包中的 SPL Token 和剩余 SOL 归集到一个目标地址，并保留预留手续费。
          </p>
          <div className={styles.panelBody}>
            <input
              className={styles.input}
              placeholder="目标地址"
              value={migrationDestination}
              onChange={(event) => setMigrationDestination(event.target.value.trim())}
            />
            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={keepLamports}
                onChange={(event) => setKeepLamports(Number(event.target.value))}
              />
              <label className={styles.pill}>
                <input
                  type="checkbox"
                  checked={includeTokens}
                  onChange={(event) => setIncludeTokens(event.target.checked)}
                />
                <span style={{ marginLeft: 8 }}>同时迁移 SPL Token</span>
              </label>
            </div>
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || selectedWallets.length === 0 || !migrationDestination}
                onClick={runMigration}
              >
                执行迁移
              </button>
            </div>
            {results.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有迁移结果。</div>
            )}
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel />
    </section>
  );
}
