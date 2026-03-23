import { Outlet } from "react-router-dom";

import { EnergySubnav } from "../../components/energy/energy-subnav";
import { PageHeader } from "../../components/page/page-header";

export function EnergyLayoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Energy"
        title="Tron 能量租赁"
        description="基于 Stake 2.0 演示能量冻结、委托、回收和解冻流程，适合本地教学与测试网联调。"
      />
      <EnergySubnav />
      <Outlet />
    </>
  );
}
