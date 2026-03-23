import { Link } from "react-router-dom";

import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./dashboard-page.module.scss";

const featureCards = [
  {
    title: "批量创建钱包",
    description: "在浏览器内生成 Tron 钱包并维护本地签名仓库。",
    href: "/wallets/generate"
  },
  {
    title: "批量查询余额",
    description: "批量读取 TRX 和多个 TRC20 代币余额，适合做地址矩阵核对。",
    href: "/balances/query"
  },
  {
    title: "批量转账矩阵",
    description: "一对多、多对一、多对多、中转转账都放在统一的任务面板里。",
    href: "/transfers"
  },
  {
    title: "能量租赁",
    description: "演示 Stake 2.0 冻结、委托、回收和解冻流程。",
    href: "/energy/rental"
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
          <h1 className={styles.title}>Tron 链工具案例</h1>
          <p className={styles.description}>
            这是一个基于 Vite + React + TypeScript 的前端工具案例，沿用 `solana-demo` 的多模块仪表盘布局，面向 Tron 的钱包、余额、转账与能量租赁。
          </p>
        </div>

        <div className={styles.heroStats}>
          <StatCard label="当前网络" value={network} />
          <StatCard label="钱包总数" value={String(wallets.length)} />
          <StatCard label="已选钱包" value={String(selectedWalletIds.length)} />
          <StatCard label="默认模式" value="Shasta First" />
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
          <p>钱包密钥在浏览器端本地生成与存储。链上任务通过 TronWeb 构建交易、使用本地私钥签名并广播到当前网络。</p>
        </div>
        <div className={styles.timelineCard}>
          <h2>适用场景</h2>
          <p>适合教学、地址批处理、批量转账预演、TRC20 余额核对和能量委托流程联调。切换主网前请确认金额、合约地址和手续费策略。</p>
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
