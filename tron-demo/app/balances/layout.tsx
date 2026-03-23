import { Outlet } from "react-router-dom";

import { BalanceSubnav } from "../../components/balance/balance-subnav";
import { PageHeader } from "../../components/page/page-header";

export function BalancesLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Balances"
        title="Tron 余额查询"
        description="批量读取 TRX 余额，并按合约地址批量查询 TRC20 代币余额，适合做地址资产核对与批处理前检查。"
      />
      <BalanceSubnav />
      <Outlet />
    </>
  );
}
