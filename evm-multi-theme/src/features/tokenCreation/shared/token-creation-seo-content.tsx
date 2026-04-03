import {
  FlagOutlined,
  MessageOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { getChainFullName, type ChainDefinition } from '@/config/chains'
import { tokenCreationFaqKeys } from './token-creation-seo-data'

type TokenCreationSeoContentProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

type HighlightKey = 'builder' | 'agency' | 'noCode'

const highlightIcons: Record<HighlightKey, ReactNode> = {
  builder: <RocketOutlined />,
  agency: <FlagOutlined />,
  noCode: <SafetyCertificateOutlined />,
}

export function TokenCreationSeoContent({ chainDefinition, t }: TokenCreationSeoContentProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const vars = {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }

  const highlightKeys: HighlightKey[] = ['builder', 'agency', 'noCode']
  return (
    <div className="token-seo-stack">
      <section className="surface-card token-seo-card">
        <div className="token-section-copy">
          <h2>{t('tokenCreation.seoBody.highlights.title')}</h2>
        </div>
        <div className="token-seo-grid token-seo-grid-three">
          {highlightKeys.map((key) => (
            <article className="token-seo-feature" key={key}>
              <div className="token-seo-feature-head">
                <div className="token-section-icon">{highlightIcons[key]}</div>
                <h3>{t(`tokenCreation.seoBody.highlights.${key}.title`, vars)}</h3>
              </div>
              <p>{t(`tokenCreation.seoBody.highlights.${key}.description`, vars)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card token-seo-card token-seo-faq" id="token-creation-faq">
        <div className="token-section-copy">
          <h2>{t('tokenCreation.seoBody.faq.title')}</h2>
        </div>
        <div className="token-faq-list">
          {tokenCreationFaqKeys.map((key) => (
            <article className="token-faq-item" key={key}>
              <div className="token-faq-question">
                <MessageOutlined />
                <h3>{t(`tokenCreation.seoBody.faq.${key}.question`, vars)}</h3>
              </div>
              <p>{t(`tokenCreation.seoBody.faq.${key}.answer`, vars)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
