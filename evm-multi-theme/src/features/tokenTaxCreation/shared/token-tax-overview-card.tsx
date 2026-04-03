import {
  DeploymentUnitOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ChainDefinition } from '@/config/chains'

type TokenTaxOverviewCardProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenTaxOverviewCard({ chainDefinition, t }: TokenTaxOverviewCardProps) {
  const highlights = [
    chainDefinition.tokenType,
    t('tokenTaxCreation.overview.highlights.base'),
    t('tokenTaxCreation.overview.highlights.buy'),
    t('tokenTaxCreation.overview.highlights.sell'),
    t('tokenTaxCreation.overview.highlights.receiver'),
  ]

  const cards = [
    {
      key: 'taxPlan',
      icon: <PercentageOutlined />,
      title: t('tokenTaxCreation.overview.cards.taxPlan.title'),
      description: t('tokenTaxCreation.overview.cards.taxPlan.description'),
    },
    {
      key: 'receiver',
      icon: <WalletOutlined />,
      title: t('tokenTaxCreation.overview.cards.receiver.title'),
      description: t('tokenTaxCreation.overview.cards.receiver.description'),
    },
    {
      key: 'trading',
      icon: <DeploymentUnitOutlined />,
      title: t('tokenTaxCreation.overview.cards.trading.title'),
      description: t('tokenTaxCreation.overview.cards.trading.description'),
    },
  ]

  return (
    <section className="surface-card token-permission-card">
      <div className="permission-hero">
        <div className="permission-hero-layout">
          <div className="permission-hero-badge">
            <div className="token-section-icon">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="permission-hero-content">
            <div className="token-section-copy">
              <h3>{t('tokenTaxCreation.overview.title')}</h3>
              <p>{t('tokenTaxCreation.overview.description')}</p>
            </div>
          </div>
        </div>

        <div className="permission-highlight-row">
          {highlights.map((highlight) => (
            <span className="permission-highlight-pill" key={highlight}>
              {highlight}
            </span>
          ))}
        </div>
      </div>

      <div className="permission-card-grid">
        {cards.map((card) => (
          <article className="permission-feature-card" key={card.key}>
            <div className="permission-feature-head">
              <div className="permission-feature-icon">{card.icon}</div>
              <h4>{card.title}</h4>
            </div>
            <div className="permission-feature-copy">
              <p>{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
