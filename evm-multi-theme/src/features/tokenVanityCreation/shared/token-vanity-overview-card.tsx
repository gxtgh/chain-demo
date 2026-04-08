import {
  DeploymentUnitOutlined,
  HourglassOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ChainDefinition } from '@/config/chains'

type TokenVanityOverviewCardProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenVanityOverviewCard({ chainDefinition, t }: TokenVanityOverviewCardProps) {
  const vars = { tokenType: chainDefinition.tokenType }
  const highlights = [
    chainDefinition.tokenType,
    t('tokenVanityCreation.overview.highlights.create2'),
    t('tokenVanityCreation.overview.highlights.prefix'),
    t('tokenVanityCreation.overview.highlights.noCode'),
  ]

  const cards = [
    {
      key: 'identity',
      icon: <SafetyCertificateOutlined />,
      title: t('tokenVanityCreation.overview.cards.identity.title'),
      description: t('tokenVanityCreation.overview.cards.identity.description'),
    },
    {
      key: 'binding',
      icon: <DeploymentUnitOutlined />,
      title: t('tokenVanityCreation.overview.cards.binding.title'),
      description: t('tokenVanityCreation.overview.cards.binding.description'),
    },
    {
      key: 'searchCost',
      icon: <HourglassOutlined />,
      title: t('tokenVanityCreation.overview.cards.searchCost.title'),
      description: t('tokenVanityCreation.overview.cards.searchCost.description'),
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
              <h3>{t('tokenVanityCreation.overview.title')}</h3>
              <p>{t('tokenVanityCreation.overview.description', vars)}</p>
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
