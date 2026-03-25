import { useCurrentAccount } from "@mysten/dapp-kit";

import { useUi } from "../ui/ui-context";

type AccountSummaryProps = {
  title?: string;
  description?: string;
};

export function AccountSummary({
  title = "Connected Wallet",
  description = "Use wallet mode for connected signing, or switch to private-key mode on pages that support local signing."
}: AccountSummaryProps) {
  const account = useCurrentAccount();
  const { locale, text } = useUi();

  const resolvedDescription =
    description === "Use wallet mode for connected signing, or switch to private-key mode on pages that support local signing."
      ? locale === "zh-CN"
        ? "支持钱包模式的页面会直接使用已连接钱包签名，需要本地私钥的场景则可以切到私钥模式。"
        : description
      : description;

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h3>{title === "Connected Wallet" ? text.common.connectedWallet : title}</h3>
      </div>
      <p className="muted-text">{resolvedDescription}</p>
      <div className="info-grid">
        <div className="info-item">
          <span>{text.common.status}</span>
          <strong>{account ? text.common.connected : text.common.notConnected}</strong>
        </div>
        <div className="info-item">
          <span>{text.common.address}</span>
          <strong>{account?.address ?? "--"}</strong>
        </div>
      </div>
    </section>
  );
}
