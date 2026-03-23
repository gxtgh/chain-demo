import { Link } from "react-router-dom";

import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./balance-shell.module.scss";

export function BalanceOverviewPage() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前网络" value={network} />
        <MetaCard label="钱包总数" value={String(wallets.length)} />
        <MetaCard label="查询资产" value="TRX + TRC20" />
        <MetaCard label="适用场景" value="批量核对" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量读取资产</h2>
          <p className={styles.panelDescription}>
            支持按当前网络钱包池批量读取 TRX 和多个 TRC20 代币余额。你可以把合约地址逐行填写，用于快速检查地址矩阵资产情况。
          </p>
          <div className={styles.buttonRow}>
            <Link className={styles.buttonLink} to="/balances/query">
              前往查询余额
            </Link>
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>推荐用法</h2>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>转账前检查源地址 TRX 是否足够支付手续费</div>
            <div className={styles.featureItem}>批量验证多地址 TRC20 代币分布情况</div>
            <div className={styles.featureItem}>主网与测试网钱包分网络核对余额</div>
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
