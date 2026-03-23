import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { LiquiditySubnav } from "../../components/liquidity/liquidity-subnav";
import styles from "../../components/liquidity/liquidity-shell.module.scss";

export function LiquidityLayoutPage() {
  return (
    <section className={styles.stack}>
      <PageHeader
        eyebrow="Liquidity"
        title="流动性管理"
        description="流动性模块按操作类型拆成多个子路由页面。当前先交付教学型参数页和协议占位适配层，后续再逐步对接真实协议。"
      />
      <LiquiditySubnav />
      <Outlet />
    </section>
  );
}

