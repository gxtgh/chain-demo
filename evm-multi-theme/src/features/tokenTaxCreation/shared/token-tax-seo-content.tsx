import {
  FileDoneOutlined,
  MessageOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { getChainFullName, type ChainDefinition } from '@/config/chains'
import { tokenTaxFaqKeys } from './token-tax-seo-data'

type TokenTaxSeoContentProps = {
  chainDefinition: ChainDefinition
  t: (key: string, vars?: Record<string, string | number>) => string
}

type HighlightKey = 'template' | 'control' | 'receiver'

const highlightIcons: Record<HighlightKey, ReactNode> = {
  template: <SafetyCertificateOutlined />,
  control: <PercentageOutlined />,
  receiver: <FileDoneOutlined />,
}

export function TokenTaxSeoContent({ chainDefinition, t }: TokenTaxSeoContentProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const vars = {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }

  const highlightKeys: HighlightKey[] = ['template', 'control', 'receiver']

  return (
    <div className="token-seo-stack">
      <section className="surface-card token-seo-card">
        <div className="token-section-copy">
          <h2>{t('tokenTaxCreation.seoBody.highlights.title')}</h2>
        </div>
        <div className="token-seo-grid token-seo-grid-three">
          {highlightKeys.map((key) => (
            <article className="token-seo-feature" key={key}>
              <div className="token-seo-feature-head">
                <div className="token-section-icon">{highlightIcons[key]}</div>
                <h3>{t(`tokenTaxCreation.seoBody.highlights.${key}.title`, vars)}</h3>
              </div>
              <p>{t(`tokenTaxCreation.seoBody.highlights.${key}.description`, vars)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card token-seo-card token-seo-faq" id="token-tax-creation-faq">
        <div className="token-section-copy">
          <h2>{t('tokenTaxCreation.seoBody.faq.title')}</h2>
        </div>
        <div className="token-faq-list">
          {tokenTaxFaqKeys.map((key) => (
            <article className="token-faq-item" key={key}>
              <div className="token-faq-question">
                <MessageOutlined />
                <h3>{t(`tokenTaxCreation.seoBody.faq.${key}.question`, vars)}</h3>
              </div>
              <p>{t(`tokenTaxCreation.seoBody.faq.${key}.answer`, vars)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
