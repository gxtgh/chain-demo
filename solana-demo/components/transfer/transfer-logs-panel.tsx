import type { BatchTaskLog } from "../../types/task";
import styles from "./transfer-shell.module.scss";

export function TransferLogsPanel(props: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>转账日志</h2>
      <p className={styles.panelDescription}>记录转账任务的执行过程、重试和链上签名。</p>
      <div className={styles.panelBody}>
        {props.logs.length > 0 ? (
          <div className={styles.logList}>
            {props.logs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className={styles.logItem}>
                <div className={styles.logMeta}>
                  {log.level} · {log.timestamp ?? "unknown time"}
                </div>
                <div className={styles.logMessage}>{log.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>当前页面还没有日志。</div>
        )}
      </div>
    </article>
  );
}

