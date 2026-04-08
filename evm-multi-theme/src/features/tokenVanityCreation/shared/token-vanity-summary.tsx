import { CopyButton } from '@/components/common/copy-button'
import { getExplorerUrl, type ChainDefinition } from '@/config/chains'
import { formatText } from '@/utils'
import type { TokenVanitySubmitResult } from '../business/model'

type TokenVanitySummaryProps = {
  chainDefinition: ChainDefinition
  result: TokenVanitySubmitResult
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenVanitySummary({ chainDefinition, result, t }: TokenVanitySummaryProps) {
  const detailItems = [
    {
      key: 'tokenAddress',
      label: t('tokenVanityCreation.successSummary.tokenAddress'),
      value: result.tokenAddress,
      link: getExplorerUrl(chainDefinition, 'token', result.tokenAddress),
      copyLabel: 'copy token address',
    },
    {
      key: 'txHash',
      label: t('tokenVanityCreation.successSummary.txHash'),
      value: result.txHash,
      link: getExplorerUrl(chainDefinition, 'hash', result.txHash),
      copyLabel: 'copy tx hash',
    },
  ]

  return (
    <section className="token-success-section">
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
