import { Link } from "react-router-dom";

import { OverviewCard } from "../components/common/overview-card";
import { PageHeader } from "../components/page/page-header";
import { useUi } from "../components/ui/ui-context";

export function HomePage() {
  const { text } = useUi();
  const featureCards = [
    {
      title: text.home.cards.standardToken.title,
      description: text.home.cards.standardToken.description,
      to: "/tokens/standard"
    },
    {
      title: text.home.cards.wallets.title,
      description: text.home.cards.wallets.description,
      to: "/wallets/generate"
    },
    {
      title: text.home.cards.transfers.title,
      description: text.home.cards.transfers.description,
      to: "/transfers"
    },
    {
      title: text.home.cards.liquidity.title,
      description: text.home.cards.liquidity.description,
      to: "/liquidity"
    },
    {
      title: text.home.cards.trade.title,
      description: text.home.cards.trade.description,
      to: "/trade"
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={text.home.eyebrow}
        title={text.home.title}
        description={text.home.description}
      />

      <section className="hero-grid">
        {featureCards.map((card) => (
          <OverviewCard key={card.to} title={card.title} description={card.description}>
            <Link className="inline-link" to={card.to}>
              {text.home.openCase}
            </Link>
          </OverviewCard>
        ))}
      </section>
    </div>
  );
}
