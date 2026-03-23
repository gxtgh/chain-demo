import type { BatchTaskLog } from "../../types/task";
import styles from "./energy-shell.module.scss";

export function EnergyLogsPanel({ logs }: { logs: BatchTaskLog[] }) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>执行日志</h2>
      <p className={styles.panelDescription}>记录冻结、委托、回收和解冻过程。</p>
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
        <div className={styles.empty}>还没有能量任务日志。</div>
      )}
    </article>
  );
}
