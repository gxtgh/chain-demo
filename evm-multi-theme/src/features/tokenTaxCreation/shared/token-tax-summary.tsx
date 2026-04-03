import { CopyButton } from '@/components/common/copy-button'
import type { ChainDefinition } from '@/config/chains'
import { formatText } from '@/utils'
import { formatTaxRate, type TaxExchangeOption, type TokenTaxFormValues, type TokenTaxSubmitResult } from '../business/model'
import type { TokenDisplayItem } from '@/components/common/token-display'

type TokenTaxSummaryProps = {
  chainDefinition: ChainDefinition
  formValues: TokenTaxFormValues
  result: TokenTaxSubmitResult
  exchanges: TaxExchangeOption[]
  poolTokens: TokenDisplayItem[]
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenTaxSummary({
  chainDefinition,
  formValues,
  result,
  exchanges,
  poolTokens,
  t,
}: TokenTaxSummaryProps) {
  const selectedExchange = exchanges.find((item) => item.value === formValues.exchange)
  const selectedPoolToken = poolTokens.find((item) => item.address === formValues.poolToken)
  const summaryItems = [
    { key: 'chain', label: t('tokenTaxCreation.successSummary.chain'), value: chainDefinition.fullName },
    { key: 'name', label: t('tokenTaxCreation.successSummary.name'), value: formValues.name || '--' },
    { key: 'symbol', label: t('tokenTaxCreation.successSummary.symbol'), value: formValues.symbol || '--' },
    { key: 'totalSupply', label: t('tokenTaxCreation.successSummary.totalSupply'), value: formatSupply(formValues.totalSupply) || '--' },
    { key: 'decimals', label: t('tokenTaxCreation.successSummary.decimals'), value: String(formValues.decimals ?? '--') },
    { key: 'buyTax', label: t('tokenTaxCreation.successSummary.buyTax'), value: formatTaxRate(formValues.buyTax) },
    { key: 'sellTax', label: t('tokenTaxCreation.successSummary.sellTax'), value: formatTaxRate(formValues.sellTax) },
    { key: 'exchange', label: t('tokenTaxCreation.successSummary.exchange'), value: selectedExchange?.label ?? '--' },
    {
      key: 'poolToken',
      label: t('tokenTaxCreation.successSummary.poolToken'),
      value: selectedPoolToken?.symbol ?? formatValue(formValues.poolToken),
    },
  ]

  const detailItems = [
    {
      key: 'taxReceiver',
      label: t('tokenTaxCreation.successSummary.taxReceiver'),
      value: result.taxReceiverAddress,
      copyLabel: 'copy tax receiver address',
    },
    {
      key: 'tokenAddress',
      label: t('tokenTaxCreation.successSummary.tokenAddress'),
      value: result.tokenAddress,
      link: result.tokenExplorerUrl,
      copyLabel: 'copy token address',
    },
    {
      key: 'txHash',
      label: t('tokenTaxCreation.successSummary.txHash'),
      value: result.txHash,
      link: result.txExplorerUrl,
      copyLabel: 'copy tx hash',
    },
  ]

  return (
    <section className="token-success-section">
      <div className="token-success-copy">
        <h3>{t('tokenTaxCreation.successSummary.title')}</h3>
        <p>{t('tokenTaxCreation.successSummary.description')}</p>
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

function formatValue(value: string) {
  if (!value) {
    return '--'
  }

  if (value === '0x0000000000000000000000000000000000000000') {
    return 'Native'
  }

  return formatText(value)
}
