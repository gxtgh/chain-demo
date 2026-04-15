import {
  DeploymentUnitOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ChainDefinition } from '@/config/chains'

type TokenDividendOverviewCardProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenDividendOverviewCard({ chainDefinition, t }: TokenDividendOverviewCardProps) {
  const highlights = [
    chainDefinition.tokenType,
    t('tokenDividendCreation.overview.highlights.mode'),
    t('tokenDividendCreation.overview.highlights.tax'),
    t('tokenDividendCreation.overview.highlights.reward'),
    t('tokenDividendCreation.overview.highlights.manage'),
  ]

  const cards = [
    {
      key: 'dividendModes',
      icon: <WalletOutlined />,
      title: t('tokenDividendCreation.overview.cards.dividendModes.title'),
      description: t('tokenDividendCreation.overview.cards.dividendModes.description'),
    },
    {
      key: 'taxFlow',
      icon: <PercentageOutlined />,
      title: t('tokenDividendCreation.overview.cards.taxFlow.title'),
      description: t('tokenDividendCreation.overview.cards.taxFlow.description'),
    },
    {
      key: 'management',
      icon: <DeploymentUnitOutlined />,
      title: t('tokenDividendCreation.overview.cards.management.title'),
      description: t('tokenDividendCreation.overview.cards.management.description'),
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
              <h3>{t('tokenDividendCreation.overview.title')}</h3>
              <p>{t('tokenDividendCreation.overview.description', { tokenType: chainDefinition.tokenType })}</p>
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
