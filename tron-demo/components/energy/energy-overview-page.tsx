import { Link } from "react-router-dom";

import styles from "./energy-shell.module.scss";

export function EnergyOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="流程基线" value="Stake 2.0" />
        <MetaCard label="资源类型" value="ENERGY" />
        <MetaCard label="支持动作" value="冻结/委托" />
        <MetaCard label="回收动作" value="回收/解冻" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>能量租赁演示</h2>
          <p className={styles.panelDescription}>
            这里用 Tron 的 Stake 2.0 冻结与委托能力模拟“能量租赁”流程，适合测试网演示和批量任务前预演。
          </p>
          <div className={styles.buttonRow}>
            <Link className={styles.buttonLink} to="/energy/rental">
              前往能量租赁
            </Link>
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>流程说明</h2>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>先冻结 TRX 为 ENERGY</div>
            <div className={styles.featureItem}>再把 ENERGY 对应资源委托给目标地址</div>
            <div className={styles.featureItem}>任务结束后可以回收委托并解冻</div>
          </div>
        </article>
      </div>
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
