import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { WalletSubnav } from "../../components/wallet/wallet-subnav";

export function WalletsLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Wallets"
        title="TON 钱包管理"
        description="在浏览器内批量创建 TON 钱包，保存助记词仓库，并为一转多、多转一、多转多、中转任务提供本地签名源。"
      />
      <WalletSubnav />
      <Outlet />
    </>
  );
}
