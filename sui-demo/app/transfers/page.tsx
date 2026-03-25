import { OverviewCard } from "../../components/common/overview-card";
import { useUi } from "../../components/ui/ui-context";

export function TransfersPage() {
  const { text } = useUi();

  return (
    <div className="hero-grid">
      <OverviewCard title={text.sections.transfers.cards.oneToMany.title} description={text.sections.transfers.cards.oneToMany.description} />
      <OverviewCard title={text.sections.transfers.cards.manyToOne.title} description={text.sections.transfers.cards.manyToOne.description} />
      <OverviewCard title={text.sections.transfers.cards.manyToMany.title} description={text.sections.transfers.cards.manyToMany.description} />
      <OverviewCard title={text.sections.transfers.cards.relay.title} description={text.sections.transfers.cards.relay.description} />
    </div>
  );
}
