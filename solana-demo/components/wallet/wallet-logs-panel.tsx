import type { BatchTaskLog } from "../../types/task";
import styles from "./wallet-shell.module.scss";

export function WalletLogsPanel(props: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>任务日志</h2>
      <p className={styles.panelDescription}>
        这里会显示当前子页面的批处理日志，用于观察并发、重试和链上执行过程。
      </p>
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

