import { Link } from "react-router-dom";

import styles from "./approval-shell.module.scss";

const authorityPages = [
  {
    to: "/approvals/authority/mint",
    title: "Mint Authority",
    description: "修改谁可以继续增发某个 mint。"
  },
  {
    to: "/approvals/authority/freeze",
    title: "Freeze Authority",
    description: "修改谁可以冻结或解冻某个 mint 下的 token account。"
  },
  {
    to: "/approvals/authority/owner",
    title: "Account Owner",
    description: "修改某个 token account 的 owner。"
  },
  {
    to: "/approvals/authority/close",
    title: "Close Authority",
    description: "修改谁可以关闭某个 token account。"
  },
  {
    to: "/approvals/authority/clear",
    title: "Clear Authority",
    description: "把某类 authority 设为 null，通常是永久放弃该权限。"
  }
];

export function ApprovalAuthorityOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="覆盖范围" value="SPL Token 标准权限" />
        <MetaCard label="真实执行" value="SetAuthority 指令" />
        <MetaCard label="高风险项" value="Mint / Freeze / Owner" />
        <MetaCard label="建议" value="先在测试网演练" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>Set Authority 全家桶</h2>
        <p className={styles.panelDescription}>
          这一组页面覆盖标准 SPL Token 中最重要的权限变更能力。它们不属于“额度授权”，而是直接改变某个权限归属。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.cardGrid}>
            {authorityPages.map((item) => (
              <Link key={item.to} to={item.to} className={styles.linkCard}>
                <h3 className={styles.linkCardTitle}>{item.title}</h3>
                <p className={styles.linkCardBody}>{item.description}</p>
              </Link>
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
