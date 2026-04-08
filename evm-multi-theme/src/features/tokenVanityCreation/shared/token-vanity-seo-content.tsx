import {
  BgColorsOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { getChainFullName, type ChainDefinition } from '@/config/chains'
import { tokenVanityFaqKeys } from './token-vanity-seo-data'

type TokenVanitySeoContentProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

type HighlightKey = 'brand' | 'workflow' | 'boundary'

const highlightIcons: Record<HighlightKey, ReactNode> = {
  brand: <BgColorsOutlined />,
  workflow: <ThunderboltOutlined />,
  boundary: <SafetyCertificateOutlined />,
}

export function TokenVanitySeoContent({ chainDefinition, t }: TokenVanitySeoContentProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const vars = {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }

  const highlightKeys: HighlightKey[] = ['brand', 'workflow', 'boundary']

  return (
    <div className="token-seo-stack">
      <section className="surface-card token-seo-card">
        <div className="token-section-copy">
          <h2>{t('tokenVanityCreation.seoBody.highlights.title')}</h2>
        </div>
        <div className="token-seo-grid token-seo-grid-three">
          {highlightKeys.map((key) => (
            <article className="token-seo-feature" key={key}>
              <div className="token-seo-feature-head">
                <div className="token-section-icon">{highlightIcons[key]}</div>
                <h3>{t(`tokenVanityCreation.seoBody.highlights.${key}.title`, vars)}</h3>
              </div>
              <p>{t(`tokenVanityCreation.seoBody.highlights.${key}.description`, vars)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card token-seo-card token-seo-faq" id="token-vanity-creation-faq">
        <div className="token-section-copy">
          <h2>{t('tokenVanityCreation.seoBody.faq.title')}</h2>
        </div>
        <div className="token-faq-list">
          {tokenVanityFaqKeys.map((key) => (
            <article className="token-faq-item" key={key}>
              <div className="token-faq-question">
                <MessageOutlined />
                <h3>{t(`tokenVanityCreation.seoBody.faq.${key}.question`, vars)}</h3>
              </div>
              <p>{t(`tokenVanityCreation.seoBody.faq.${key}.answer`, vars)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
