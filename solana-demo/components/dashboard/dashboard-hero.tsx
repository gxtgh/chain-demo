import styles from "./dashboard-page.module.scss";

export function DashboardHero(props: {
  connected: boolean;
  publicKey?: string;
}) {
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Dashboard</p>
      <h1 className={styles.heroTitle}>Solana Frontend Toolkit</h1>
      <p className={styles.heroDescription}>
        当前交付的是基础设施层。我们已经把钱包连接、网络切换、RPC 配置、Solscan
        Client 和模块化目录先搭好，后续功能会在这些 service 层之上逐步填充。
      </p>

      <div className={styles.statusGrid}>
        <StatusCard label="钱包状态" value={props.connected ? "已连接" : "未连接"} />
        <StatusCard label="当前地址" value={props.publicKey ?? "等待连接钱包"} />
        <StatusCard label="架构模式" value="纯前端 / 去中心化" />
        <StatusCard label="当前阶段" value="Phase 1 基础设施" />
      </div>
    </section>
  );
}

function StatusCard(props: { label: string; value: string }) {
  return (
    <div className={styles.statusCard}>
      <p className={styles.statusLabel}>{props.label}</p>
      <p className={styles.statusValue}>{props.value}</p>
    </div>
  );
}
