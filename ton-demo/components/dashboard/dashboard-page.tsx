import { Link } from "react-router-dom";

import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./dashboard-page.module.scss";

const featureCards = [
  {
    title: "钱包创建",
    description: "批量生成 TON V4R2 钱包，保存在浏览器本地仓库中。",
    href: "/wallets/generate"
  },
  {
    title: "一转多",
    description: "单钱包一次性发送多条内部消息，适合批量分发。",
    href: "/transfers/one-to-many"
  },
  {
    title: "多转一 / 多转多",
    description: "用本地钱包池逐笔签名，适合归集和矩阵分发。",
    href: "/transfers/many-to-one"
  },
  {
    title: "中转转账",
    description: "两段式链路演示源钱包、中转钱包和目标钱包之间的流转。",
    href: "/transfers/relay"
  }
];

export function DashboardPage() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <div className={styles.stack}>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>Scenario</p>
          <h1 className={styles.title}>TON 链工具案例</h1>
          <p className={styles.description}>
            这是一个基于 Vite + React + TypeScript 的前端演示项目，沿用 `solana-demo` 的仪表盘布局与路由分层，面向 TON 钱包管理与多种批量转账模式。
          </p>
        </div>

        <div className={styles.heroStats}>
          <StatCard label="当前网络" value={network} />
          <StatCard label="钱包总数" value={String(wallets.length)} />
          <StatCard label="已选钱包" value={String(selectedWalletIds.length)} />
          <StatCard label="默认模式" value="Testnet First" />
        </div>
      </section>

      <section className={styles.panelGrid}>
        {featureCards.map((item) => (
          <Link key={item.href} to={item.href} className={styles.featureCard}>
            <p className={styles.featureTitle}>{item.title}</p>
            <p className={styles.featureDescription}>{item.description}</p>
          </Link>
        ))}
      </section>

      <section className={styles.timeline}>
        <div className={styles.timelineCard}>
          <h2>落地方式</h2>
          <p>钱包通过助记词在浏览器内生成，存储于本地持久化仓库。批量转账直接使用本地助记词派生密钥对并签名，再通过 TON RPC 广播。</p>
        </div>
        <div className={styles.timelineCard}>
          <h2>适用场景</h2>
          <p>适合教学演示、批量任务预演、地址矩阵校验和测试网链路联调。切换 Mainnet 前请先检查金额、地址和手续费余额。</p>
        </div>
      </section>
    </div>
  );
}

function StatCard(props: { label: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{props.label}</div>
      <div className={styles.statValue}>{props.value}</div>
    </div>
  );
}
