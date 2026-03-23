import type { BatchTaskLog } from "../../types/task";
import styles from "./balance-shell.module.scss";

export function BalanceLogsPanel({ logs }: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>查询日志</h2>
      <p className={styles.panelDescription}>记录地址批量查询、代币合约读取与异常信息。</p>

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
        <div className={styles.empty}>还没有余额查询日志。</div>
      )}
    </article>
  );
}
