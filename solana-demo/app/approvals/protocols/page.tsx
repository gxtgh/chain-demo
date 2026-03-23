import { ApprovalResourcePage } from "../../../components/approval/approval-resource-page";

export function ApprovalProtocolsRoutePage() {
  return (
    <ApprovalResourcePage
      title="协议级授权"
      description="协议级授权没有链上统一标准，通常要针对具体协议单独适配。这里先给出高频协议覆盖清单和适配位。"
      currentCoverage="协议适配层"
      todo={[
        "Raydium / AMM 相关授权与池子交互权限",
        "OpenBook / Serum 订单账户与 market 相关权限",
        "NFT 市场 listing / escrow 授权",
        "Stake / LSD 协议里的 operator / withdraw 权限",
        "自定义 Program authority 适配接口"
      ]}
    />
  );
}
