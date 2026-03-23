import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { TransferSubnav } from "../../components/transfer/transfer-subnav";

export function TransfersLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transfers"
        title="TON 转账编排"
        description="统一管理 4 类转账模式。默认接入 TON Testnet 公共 RPC，适合演示批量转账流程、表单解析、日志追踪与本地签名。"
      />
      <TransferSubnav />
      <Outlet />
    </>
  );
}
