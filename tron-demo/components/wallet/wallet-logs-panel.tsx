import type { BatchTaskLog } from "../../types/task";
import styles from "./wallet-shell.module.scss";

export function WalletLogsPanel({ logs }: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>任务日志</h2>
      <p className={styles.panelDescription}>记录钱包创建、导入、导出和仓库操作。</p>

      {logs.length ? (
        <div className={styles.logList}>
          {logs.map((logItem, index) => (
            <div key={`${logItem.timestamp}-${index}`} className={styles.logItem}>
              <div className={styles.logMeta}>
                {logItem.level} · {logItem.timestamp}
              </div>
              <div className={styles.logMessage}>{logItem.message}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>还没有钱包任务日志。</div>
      )}
    </article>
  );
}
