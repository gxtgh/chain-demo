import styles from "./transfer-shell.module.scss";

export function TransferOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="模块结构" value="独立子路由" />
        <MetaCard label="执行模式" value="前端本地签名" />
        <MetaCard label="批量能力" value="并发 + 重试 + 日志" />
        <MetaCard label="任务来源" value="文本 / 钱包仓库" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>转账模块总览</h2>
        <p className={styles.panelDescription}>
          当前已经拆出一转多、多转一、多转多和中转转账四个工作页。每页都复用同一套本地钱包仓库和转账 service，并支持 SOL 与指定 SPL Token。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.empty}>
            建议先在钱包模块准备好本地钱包和资金，再进入对应转账子页执行任务。
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
