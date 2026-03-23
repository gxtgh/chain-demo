import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { TransferSubnav } from "../../components/transfer/transfer-subnav";

export function TransfersLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transfers"
        title="Tron 转账矩阵"
        description="统一管理一对多、多对一、多对多和中转转账。支持 TRX 和 TRC20 两种资产模式。"
      />
      <TransferSubnav />
      <Outlet />
    </>
  );
}
