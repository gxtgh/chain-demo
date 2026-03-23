import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import styles from "./app-shell.module.scss";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <Sidebar />
        <div className={styles.content}>
          <Topbar />
          <div className={styles.contentInner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
