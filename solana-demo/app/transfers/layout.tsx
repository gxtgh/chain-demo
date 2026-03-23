import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { TransferSubnav } from "../../components/transfer/transfer-subnav";
import styles from "../../components/transfer/transfer-shell.module.scss";

export function TransfersLayoutPage() {
  return (
    <section className={styles.stack}>
      <PageHeader
        eyebrow="Transfers"
        title="转账模块"
        description="转账模块已经拆成多个子路由页面。每个页面都聚焦一种编排模式，并复用同一套 service、日志和本地钱包仓库。"
      />
      <TransferSubnav />
      <Outlet />
    </section>
  );
}

