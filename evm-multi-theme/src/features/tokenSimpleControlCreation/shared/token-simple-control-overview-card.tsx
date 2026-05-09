import {
  ControlOutlined,
  DeploymentUnitOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ChainDefinition } from '@/config/chains'

type TokenSimpleControlOverviewCardProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenSimpleControlOverviewCard({ chainDefinition, t }: TokenSimpleControlOverviewCardProps) {
  const highlights = [
    chainDefinition.tokenType,
    t('tokenSimpleControlCreation.overview.highlights.mint'),
    t('tokenSimpleControlCreation.overview.highlights.pause'),
    t('tokenSimpleControlCreation.overview.highlights.blacklist'),
    t('tokenSimpleControlCreation.overview.highlights.walletLimit'),
  ]

  const cards = [
    {
      key: 'permissions',
      icon: <ControlOutlined />,
      title: t('tokenSimpleControlCreation.overview.cards.permissions.title'),
      description: t('tokenSimpleControlCreation.overview.cards.permissions.description'),
    },
    {
      key: 'limits',
      icon: <LockOutlined />,
      title: t('tokenSimpleControlCreation.overview.cards.limits.title'),
      description: t('tokenSimpleControlCreation.overview.cards.limits.description'),
    },
    {
      key: 'management',
      icon: <DeploymentUnitOutlined />,
      title: t('tokenSimpleControlCreation.overview.cards.management.title'),
      description: t('tokenSimpleControlCreation.overview.cards.management.description'),
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
              <h3>{t('tokenSimpleControlCreation.overview.title')}</h3>
              <p>{t('tokenSimpleControlCreation.overview.description', { tokenType: chainDefinition.tokenType })}</p>
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
