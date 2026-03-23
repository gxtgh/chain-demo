import { useState, useTransition } from "react";

import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";
import { walletService } from "../../lib/wallet/wallet-service";
import type { VanitySearchMatch } from "../../types/wallet";

export function WalletVanityPage() {
  const addWallets = useWalletStore((state) => state.addWallets);
  const [vanityPrefix, setVanityPrefix] = useState("");
  const [vanitySuffix, setVanitySuffix] = useState("");
  const [vanityLimit, setVanityLimit] = useState(1);
  const [vanityAttempts, setVanityAttempts] = useState(20000);
  const [matches, setMatches] = useState<VanitySearchMatch[]>([]);
  const [summary, setSummary] = useState("暂时还没有靓号搜索结果。");
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useWalletTaskLogs();

  function runVanitySearch() {
    startTransition(async () => {
      try {
        const result = await walletService.findVanityWallets(
          {
            prefix: vanityPrefix || undefined,
            suffix: vanitySuffix || undefined,
            limit: vanityLimit,
            maxAttempts: vanityAttempts
          },
          appendLog
        );

        setMatches(result);
        addWallets(result.map((item) => item.wallet));
        setSummary(
          result.length > 0
            ? `搜索完成，命中 ${result.length} 个结果。`
            : `搜索完成，在 ${vanityAttempts} 次尝试内没有命中结果。`
        );
      } catch (error) {
        setSummary(error instanceof Error ? error.message : "靓号搜索失败。");
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>靓号地址生成</h2>
          <p className={styles.panelDescription}>
            当前采用前端穷举搜索，命中后的钱包会自动写入本地钱包仓库，便于后续查询和迁移。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                placeholder="前缀，例如 sol"
                value={vanityPrefix}
                onChange={(event) => setVanityPrefix(event.target.value.trim())}
              />
              <input
                className={styles.input}
                placeholder="后缀，例如 88"
                value={vanitySuffix}
                onChange={(event) => setVanitySuffix(event.target.value.trim())}
              />
            </div>
            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={vanityLimit}
                onChange={(event) => setVanityLimit(Number(event.target.value))}
              />
              <input
                className={styles.input}
                type="number"
                min={1000}
                value={vanityAttempts}
                onChange={(event) => setVanityAttempts(Number(event.target.value))}
              />
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending} onClick={runVanitySearch}>
                {isPending ? "搜索中..." : "搜索靓号"}
              </button>
            </div>
            {matches.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(matches, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>{summary}</div>
            )}
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel />
    </section>
  );
}
