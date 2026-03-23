import { useState, useTransition } from "react";

import { walletService } from "../../lib/wallet/wallet-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";

export function WalletGeneratePage() {
  const network = useNetworkStore((state) => state.network);
  const addWallets = useWalletStore((state) => state.addWallets);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [generateCount, setGenerateCount] = useState(5);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useWalletTaskLogs();

  function runGenerate() {
    startTransition(async () => {
      try {
        const generated = await walletService.generateWallets(generateCount, network);
        addWallets(generated);
        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: `已在 ${network} 生成 ${generated.length} 个 TON 钱包。`
        });
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="钱包总数" value={String(wallets.length)} />
        <MetaCard label="已选钱包" value={String(selectedWalletIds.length)} />
        <MetaCard label="当前网络" value={network} />
        <MetaCard label="创建方式" value="24 助记词" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量创建钱包</h2>
          <p className={styles.panelDescription}>
            每次会在当前网络下生成新的 TON 地址与助记词，并自动写入浏览器本地仓库。推荐先在 Testnet 演练。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>数量</span>
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  max={100}
                  value={generateCount}
                  onChange={(event) => setGenerateCount(Number(event.target.value))}
                />
              </label>
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending} onClick={runGenerate}>
                {isPending ? "创建中..." : "创建钱包"}
              </button>
            </div>
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel onLog={appendLog} />
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
