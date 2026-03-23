import styles from "./approval-shell.module.scss";

export function ApprovalResourcePage(props: {
  title: string;
  description: string;
  currentCoverage: string;
  todo: string[];
}) {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前状态" value="教学型骨架" />
        <MetaCard label="覆盖层级" value={props.currentCoverage} />
        <MetaCard label="执行方式" value="占位适配层" />
        <MetaCard label="目标" value="继续接真实协议" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>{props.title}</h2>
        <p className={styles.panelDescription}>{props.description}</p>
        <div className={styles.panelBody}>
          <div className={styles.list}>
            {props.todo.map((item) => (
              <div key={item} className={styles.item}>
                {item}
              </div>
            ))}
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
