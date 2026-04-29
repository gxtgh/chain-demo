import {
  ControlOutlined,
  GiftOutlined,
  MessageOutlined,
  PercentageOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { getChainFullName, type ChainDefinition } from '@/config/chains'
import { tokenDividendFaqKeys } from './token-dividend-seo-data'

type TokenDividendSeoContentProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

type HighlightKey = 'reward' | 'tax' | 'console'

const highlightIcons: Record<HighlightKey, ReactNode> = {
  reward: <GiftOutlined />,
  tax: <PercentageOutlined />,
  console: <ControlOutlined />,
}

export function TokenDividendSeoContent({ chainDefinition, t }: TokenDividendSeoContentProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const vars = {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }

  const highlightKeys: HighlightKey[] = ['reward', 'tax', 'console']

  return (
    <div className="token-seo-stack">
      <section className="surface-card token-seo-card">
        <div className="token-section-copy">
          <h2>{t('tokenDividendCreation.seoBody.highlights.title')}</h2>
        </div>
        <div className="token-seo-grid token-seo-grid-three">
          {highlightKeys.map((key) => (
            <article className="token-seo-feature" key={key}>
              <div className="token-seo-feature-head">
                <div className="token-section-icon">{highlightIcons[key]}</div>
                <h3>{t(`tokenDividendCreation.seoBody.highlights.${key}.title`, vars)}</h3>
              </div>
              <p>{t(`tokenDividendCreation.seoBody.highlights.${key}.description`, vars)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card token-seo-card token-seo-faq" id="token-dividend-creation-faq">
        <div className="token-section-copy">
          <h2>{t('tokenDividendCreation.seoBody.faq.title')}</h2>
        </div>
        <div className="token-faq-list">
          {tokenDividendFaqKeys.map((key) => (
            <article className="token-faq-item" key={key}>
              <div className="token-faq-question">
                <MessageOutlined />
                <h3>{t(`tokenDividendCreation.seoBody.faq.${key}.question`, vars)}</h3>
              </div>
              <p>{t(`tokenDividendCreation.seoBody.faq.${key}.answer`, vars)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
