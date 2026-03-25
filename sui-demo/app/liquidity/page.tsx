import { OverviewCard } from "../../components/common/overview-card";
import { useUi } from "../../components/ui/ui-context";

export function LiquidityPage() {
  const { text } = useUi();

  return (
    <div className="hero-grid">
      <OverviewCard title={text.sections.liquidity.cards.create.title} description={text.sections.liquidity.cards.create.description} />
      <OverviewCard title={text.sections.liquidity.cards.add.title} description={text.sections.liquidity.cards.add.description} />
    </div>
  );
}
