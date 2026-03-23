import { Link } from "react-router-dom";

import styles from "./approval-shell.module.scss";

const nftCards = [
  {
    to: "/approvals/nft/update-authority",
    title: "Update Authority",
    body: "修改 NFT metadata 的 update authority。"
  },
  {
    to: "/approvals/nft/collection",
    title: "Collection Authority",
    body: "批准或撤销 collection authority。"
  },
  {
    to: "/approvals/nft/delegate",
    title: "NFT Delegate",
    body: "对标准 NFT 做 delegate / revoke。"
  }
];

export function ApprovalNftOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="Program" value="Metaplex Token Metadata" />
        <MetaCard label="已实装" value="Update / Collection / Delegate" />
        <MetaCard label="适用范围" value="标准 NFT 为主" />
        <MetaCard label="后续" value="pNFT 深化" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>NFT 授权总览</h2>
        <p className={styles.panelDescription}>
          NFT 授权和普通 SPL Token 不一样，主要走 Metaplex Token Metadata 指令。当前先覆盖最常见的三类能力。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.cardGrid}>
            {nftCards.map((card) => (
              <Link key={card.to} to={card.to} className={styles.linkCard}>
                <h3 className={styles.linkCardTitle}>{card.title}</h3>
                <p className={styles.linkCardBody}>{card.body}</p>
              </Link>
            ))}
          </div>
          <div className={styles.warningBox}>
            当前优先兼容标准 NFT。对于 Programmable NFT，通常还需要 token record、规则集等额外账户。
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
