import styles from "./rent-shell.module.scss";

export function RentOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="模块结构" value="独立子路由" />
        <MetaCard label="回收对象" value="空 SPL Token 账户" />
        <MetaCard label="流程" value="扫描 -> 估算 -> 回收" />
        <MetaCard label="执行方式" value="本地钱包签名" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>租金回收总览</h2>
        <p className={styles.panelDescription}>
          这个模块把空 SPL Token 账户的扫描和回收从钱包页独立出来，便于按步骤教学和批量操作。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.empty}>
            建议先在“扫描预估”页确认哪些钱包有可回收账户，再进入“批量回收”页执行 close account。
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

