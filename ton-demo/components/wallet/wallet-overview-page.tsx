import { Link } from "react-router-dom";

import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";

export function WalletOverviewPage() {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="钱包总数" value={String(wallets.length)} />
        <MetaCard label="已选钱包" value={String(selectedWalletIds.length)} />
        <MetaCard label="签名方式" value="本地助记词" />
        <MetaCard label="钱包版本" value="V4R2" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>本地钱包仓库</h2>
          <p className={styles.panelDescription}>
            钱包通过助记词在浏览器端生成并持久化保存，适合作为 TON 批量任务的本地签名池。默认不会上传到服务端。
          </p>
          <div className={styles.buttonRow}>
            <Link className={styles.buttonLink} to="/wallets/generate">
              前往创建钱包
            </Link>
            <Link className={styles.buttonGhostLink} to="/transfers">
              查看转账矩阵
            </Link>
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>支持的转账能力</h2>
          <p className={styles.panelDescription}>
            一转多使用单钱包多消息发送，多转一与多转多则按钱包顺序逐笔签名，中转模式会串联两段独立交易。
          </p>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>一转多: 一个源钱包向多个地址分发</div>
            <div className={styles.featureItem}>多转一: 多个本地钱包向同一目标归集</div>
            <div className={styles.featureItem}>多转多: 地址矩阵逐笔签名分发</div>
            <div className={styles.featureItem}>中转: 源钱包先到 relay，再到终点</div>
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
