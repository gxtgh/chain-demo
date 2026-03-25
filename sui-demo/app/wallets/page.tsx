import { OverviewCard } from "../../components/common/overview-card";
import { useUi } from "../../components/ui/ui-context";

export function WalletsPage() {
  const { text } = useUi();

  return (
    <div className="hero-grid">
      <OverviewCard title={text.sections.wallets.overviewTitle} description={text.sections.wallets.overviewDescription} />
    </div>
  );
}
