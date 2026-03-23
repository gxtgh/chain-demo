import type { BatchTaskLog } from "../../types/task";
import styles from "./transfer-shell.module.scss";

export function TransferLogsPanel({ logs }: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>执行日志</h2>
      <p className={styles.panelDescription}>记录表单解析、签名发送和广播结果。</p>

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
        <div className={styles.empty}>还没有转账日志。</div>
      )}
    </article>
  );
}
