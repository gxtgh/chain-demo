import { CopyButton } from '@/components/common/copy-button'
import type { ChainDefinition } from '@/config/chains'
import { formatText } from '@/utils'
import type { TokenCreationFormValues, TokenCreationSubmitResult } from '../business/model'

type TokenCreationSummaryProps = {
  chainDefinition: ChainDefinition
  formValues: TokenCreationFormValues
  result: TokenCreationSubmitResult
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenCreationSummary({ chainDefinition, formValues, result, t }: TokenCreationSummaryProps) {
  const summaryItems = [
    { key: 'chain', label: t('tokenCreation.successSummary.chain'), value: chainDefinition.fullName },
    { key: 'name', label: t('tokenCreation.successSummary.name'), value: formValues.name || '--' },
    { key: 'symbol', label: t('tokenCreation.successSummary.symbol'), value: formValues.symbol || '--' },
    { key: 'totalSupply', label: t('tokenCreation.successSummary.totalSupply'), value: formatSupply(formValues.totalSupply) || '--' },
    { key: 'decimals', label: t('tokenCreation.successSummary.decimals'), value: String(formValues.decimals ?? '--') },
  ]

  const detailItems = [
    {
      key: 'tokenAddress',
      label: t('tokenCreation.successSummary.tokenAddress'),
      value: result.tokenAddress,
      link: result.tokenExplorerUrl,
      copyLabel: 'copy token address',
    },
    {
      key: 'txHash',
      label: t('tokenCreation.successSummary.txHash'),
      value: result.txHash,
      link: result.txExplorerUrl,
      copyLabel: 'copy tx hash',
    },
  ]

  return (
    <section className="token-success-section">
      <div className="token-success-copy">
        <h3>{t('tokenCreation.successSummary.title')}</h3>
        <p>{t('tokenCreation.successSummary.description')}</p>
      </div>

      <div className="summary-stat-grid">
        {summaryItems.map((item) => (
          <article className="summary-stat-card" key={item.key}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="summary-detail-list">
        {detailItems.map((item) => (
          <div className="summary-detail-card" key={item.key}>
            <span>{item.label}</span>
            {item.value ? (
              <div className="result-inline-value">
                {item.link ? (
                  <a className="value-link" href={item.link} target="_blank" rel="noreferrer">
                    {formatText(item.value)}
                  </a>
                ) : (
                  <strong>{formatText(item.value)}</strong>
                )}
                <CopyButton ariaLabel={item.copyLabel} value={item.value} />
              </div>
            ) : (
              <strong>--</strong>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatSupply(value: string) {
  if (!value) {
    return ''
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
