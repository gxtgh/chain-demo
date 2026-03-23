import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { WalletSubnav } from "../../components/wallet/wallet-subnav";
import styles from "../../components/wallet/wallet-shell.module.scss";

export function WalletsLayoutPage() {
  return (
    <section className={styles.stack}>
      <PageHeader
        eyebrow="Wallets"
        title="钱包管理"
        description="钱包模块已经拆成多个子路由页面。每个页面聚焦一个任务，但共用同一个本地钱包仓库和 service 层。"
      />
      <WalletSubnav />
      <Outlet />
    </section>
  );
}

