import styles from "./liquidity-shell.module.scss";

export function LiquidityOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前阶段" value="接口层 + 占位适配层" />
        <MetaCard label="适配器" value="OpenBook Placeholder" />
        <MetaCard label="目标" value="教学型流程建模" />
        <MetaCard label="后续方向" value="逐步接真实协议" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>流动性模块总览</h2>
        <p className={styles.panelDescription}>
          这一阶段先把 OpenBook 和流动性相关操作拆成明确的参数页与 service 接口，方便先讲清流程和适配层设计。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.empty}>
            当前所有操作都会输出“协议占位草稿结果”，不会直接提交链上交易。这是为了先把接口和教学结构稳定下来。
          </div>
        </div>
      </article>
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

