import type { BatchTaskLog } from "../../types/task";
import styles from "./rent-shell.module.scss";

export function RentLogsPanel(props: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>租金回收日志</h2>
      <p className={styles.panelDescription}>记录扫描、估算和批量关闭账户的执行过程。</p>
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

