import { useRef, useState, useTransition } from "react";

import { walletService } from "../../lib/wallet/wallet-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";

export function WalletGeneratePage() {
  const addWallets = useWalletStore((state) => state.addWallets);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [generateCount, setGenerateCount] = useState(5);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logs, appendLog } = useWalletTaskLogs();

  function runGenerate() {
    startTransition(() => {
      const generated = walletService.generateWallets(generateCount);
      addWallets(generated);
      appendLog({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Generated ${generated.length} wallets locally.`
      });
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="本地钱包数" value={String(wallets.length)} />
        <MetaCard label="当前选中" value={String(selectedWalletIds.length)} />
        <MetaCard label="生成方式" value="前端本地 Keypair" />
        <MetaCard label="导出格式" value="JSON / CSV" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量生成钱包</h2>
          <p className={styles.panelDescription}>
            生成逻辑全部在浏览器里执行，并自动写入本地钱包仓库，适合教学演示和本地任务准备。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(event) => setGenerateCount(Number(event.target.value))}
              />
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending} onClick={runGenerate}>
                生成钱包
              </button>
            </div>
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel onLog={appendLog} fileInputRef={fileInputRef} />
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

