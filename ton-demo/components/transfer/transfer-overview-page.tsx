import { Link } from "react-router-dom";

import { useWalletStore } from "../../store/wallet-store";
import styles from "./transfer-shell.module.scss";
import { TransferWalletPanel } from "./transfer-wallet-panel";

const transferCards = [
  {
    title: "一转多",
    description: "单源钱包一次发出多条 internal message，适合批量空投或分账。",
    href: "/transfers/one-to-many"
  },
  {
    title: "多转一",
    description: "多个本地钱包向同一地址归集，逐笔签名并逐笔确认 seqno。",
    href: "/transfers/many-to-one"
  },
  {
    title: "多转多",
    description: "按 CSV 行描述 source -> destination -> amount 的矩阵转账任务。",
    href: "/transfers/many-to-many"
  },
  {
    title: "中转",
    description: "串联源钱包到 relay、relay 到目标地址的两段式操作。",
    href: "/transfers/relay"
  }
];

export function TransferOverviewPage() {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="钱包仓库" value={`${wallets.length} 个`} />
        <MetaCard label="已选签名钱包" value={`${selectedWalletIds.length} 个`} />
        <MetaCard label="资产类型" value="TON" />
        <MetaCard label="确认方式" value="Seqno 递增" />
      </div>

      <div className={styles.featureGrid}>
        {transferCards.map((item) => (
          <Link key={item.href} className={styles.featureCard} to={item.href}>
            <p className={styles.featureTitle}>{item.title}</p>
            <p className={styles.featureDescription}>{item.description}</p>
          </Link>
        ))}
      </div>

      <TransferWalletPanel />
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
