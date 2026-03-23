import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { WalletSubnav } from "../../components/wallet/wallet-subnav";

export function WalletsLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Wallets"
        title="Tron 钱包管理"
        description="批量创建 Tron 钱包、维护本地私钥仓库，并为余额查询、批量转账和能量租赁提供签名来源。"
      />
      <WalletSubnav />
      <Outlet />
    </>
  );
}
