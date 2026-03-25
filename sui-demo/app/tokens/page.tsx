import { OverviewCard } from "../../components/common/overview-card";
import { useUi } from "../../components/ui/ui-context";

export function TokensPage() {
  const { text } = useUi();

  return (
    <div className="hero-grid">
      <OverviewCard title={text.sections.tokens.overviewTitle} description={text.sections.tokens.overviewDescription} />
    </div>
  );
}
