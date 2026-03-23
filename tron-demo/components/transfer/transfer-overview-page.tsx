import { Link } from "react-router-dom";

import { useWalletStore } from "../../store/wallet-store";
import styles from "./transfer-shell.module.scss";
import { TransferWalletPanel } from "./transfer-wallet-panel";

const cards = [
  { title: "一对多", description: "单个源钱包逐笔向多个地址发送 TRX 或 TRC20。", href: "/transfers/one-to-many" },
  { title: "多对一", description: "多个源钱包向同一目标地址归集。", href: "/transfers/many-to-one" },
  { title: "多对多", description: "按照矩阵任务逐行执行 source -> destination。", href: "/transfers/many-to-many" },
  { title: "中转", description: "源钱包先给中转钱包，再由中转钱包发往终点。", href: "/transfers/relay" }
];

export function TransferOverviewPage() {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="钱包仓库" value={`${wallets.length} 个`} />
        <MetaCard label="已选签名钱包" value={`${selectedWalletIds.length} 个`} />
        <MetaCard label="支持资产" value="TRX / TRC20" />
        <MetaCard label="发送方式" value="本地私钥签名" />
      </div>

      <div className={styles.featureGrid}>
        {cards.map((item) => (
          <Link key={item.href} to={item.href} className={styles.featureCard}>
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
