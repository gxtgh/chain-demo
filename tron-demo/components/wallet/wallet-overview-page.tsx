import { Link } from "react-router-dom";

import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";

export function WalletOverviewPage() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="钱包总数" value={String(wallets.length)} />
        <MetaCard label="已选钱包" value={String(selectedWalletIds.length)} />
        <MetaCard label="当前网络" value={network} />
        <MetaCard label="签名方式" value="本地私钥" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>本地签名仓库</h2>
          <p className={styles.panelDescription}>
            Tron 钱包在浏览器端本地创建和存储，不依赖服务端。仓库里的钱包可直接参与余额查询、批量转账和能量委托。
          </p>
          <div className={styles.buttonRow}>
            <Link className={styles.buttonLink} to="/wallets/generate">
              前往创建钱包
            </Link>
            <Link className={styles.buttonGhostLink} to="/balances/query">
              查询余额
            </Link>
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>支持的任务能力</h2>
          <p className={styles.panelDescription}>
            钱包仓库会贯穿余额查询、转账矩阵与能量租赁。建议按网络分组管理，避免把测试网和主网地址混用。
          </p>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>批量创建钱包与本地私钥仓库</div>
            <div className={styles.featureItem}>TRX 与 TRC20 批量余额查询</div>
            <div className={styles.featureItem}>一对多、多对一、多对多和中转转账</div>
            <div className={styles.featureItem}>Stake 2.0 能量委托与回收</div>
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
