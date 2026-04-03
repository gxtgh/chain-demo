import {
  CheckCircleOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ChainDefinition } from '@/config/chains'

type TokenPermissionCardProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenPermissionCard({ chainDefinition, t }: TokenPermissionCardProps) {
  const highlights = [
    chainDefinition.tokenType,
    t('tokenCreation.permission.highlights.core'),
    t('tokenCreation.permission.highlights.factory'),
    t('tokenCreation.permission.highlights.noAdmin'),
  ]

  const cards = [
    {
      key: 'basicInfo',
      icon: <CheckCircleOutlined />,
      title: t('tokenCreation.permission.cards.basicInfo.title'),
      description: t('tokenCreation.permission.cards.basicInfo.description'),
    },
    {
      key: 'permissions',
      icon: <SafetyCertificateOutlined />,
      title: t('tokenCreation.permission.cards.permissions.title'),
      description: t('tokenCreation.permission.cards.permissions.description'),
    },
    {
      key: 'tradingFlow',
      icon: <DeploymentUnitOutlined />,
      title: t('tokenCreation.permission.cards.tradingFlow.title'),
      description: t('tokenCreation.permission.cards.tradingFlow.description'),
    },
  ]

  return (
    <section className="surface-card token-permission-card">
      <div className="permission-hero">
        <div className="permission-hero-layout">
          <div className="token-section-icon">
            <SafetyCertificateOutlined />
          </div>
          <div className="permission-hero-content">
            <div className="token-section-copy">
              <h3>{t('tokenCreation.permission.title')}</h3>
              <p>{t('tokenCreation.permission.description')}</p>
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
