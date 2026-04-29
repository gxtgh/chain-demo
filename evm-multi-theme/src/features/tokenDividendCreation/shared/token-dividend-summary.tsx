import { Button } from 'antd'
import { CopyButton } from '@/components/common/copy-button'
import type { TokenDisplayItem } from '@/components/common/token-display'
import { getExplorerUrl, type ChainDefinition } from '@/config/chains'
import { formatText } from '@/utils'
import {
  formatAddressLabel,
  formatDividendModeLabel,
  formatPoolTokenLabel,
  type DividendExchangeOption,
  type TokenDividendFormValues,
  type TokenDividendSubmitResult,
} from '../business/model'
import { formatTaxPercent } from '../business/tax'

type TokenDividendSummaryProps = {
  chainDefinition: ChainDefinition
  formValues: TokenDividendFormValues
  result: TokenDividendSubmitResult
  exchanges: DividendExchangeOption[]
  poolTokens: TokenDisplayItem[]
  rewardTokens: TokenDisplayItem[]
  manageConsoleUrl?: string
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenDividendSummary({
  chainDefinition,
  formValues,
  result,
  exchanges,
  poolTokens,
  rewardTokens,
  manageConsoleUrl,
  t,
}: TokenDividendSummaryProps) {
  const selectedExchange = exchanges.find((item) => item.value === formValues.exchange)
  const selectedRewardToken = rewardTokens.find((item) => item.address === formValues.dividendToken)
  const summaryItems = [
    { key: 'chain', label: t('tokenDividendCreation.successSummary.chain'), value: chainDefinition.fullName },
    { key: 'name', label: t('tokenDividendCreation.successSummary.name'), value: formValues.name || '--' },
    { key: 'symbol', label: t('tokenDividendCreation.successSummary.symbol'), value: formValues.symbol || '--' },
    { key: 'totalSupply', label: t('tokenDividendCreation.successSummary.totalSupply'), value: formatSupply(formValues.totalSupply) || '--' },
    { key: 'decimals', label: t('tokenDividendCreation.successSummary.decimals'), value: String(formValues.decimals ?? '--') },
    { key: 'mode', label: t('tokenDividendCreation.successSummary.mode'), value: formatDividendModeLabel(formValues, t) },
    {
      key: 'buyTax',
      label: t('tokenDividendCreation.successSummary.buyTax'),
      value: formatGroupTax(formValues, 'buy'),
    },
    {
      key: 'sellTax',
      label: t('tokenDividendCreation.successSummary.sellTax'),
      value: formatGroupTax(formValues, 'sell'),
    },
    {
      key: 'transferTax',
      label: t('tokenDividendCreation.successSummary.transferTax'),
      value: formatGroupTax(formValues, 'transfer'),
    },
    {
      key: 'minHoldingForDividend',
      label: t('tokenDividendCreation.successSummary.minHoldingForDividend'),
      value: formValues.minHoldingForDividend || '--',
    },
    {
      key: 'dividendTriggerThreshold',
      label: t('tokenDividendCreation.successSummary.dividendTriggerThreshold'),
      value: formValues.dividendTriggerThreshold || '--',
    },
    {
      key: 'autoProcessGasLimit',
      label: t('tokenDividendCreation.successSummary.autoProcessGasLimit'),
      value: formatSupply(formValues.autoProcessGasLimit) || '--',
    },
    {
      key: 'exchange',
      label: t('tokenDividendCreation.successSummary.exchange'),
      value: selectedExchange?.label ?? '--',
    },
    {
      key: 'poolToken',
      label: t('tokenDividendCreation.successSummary.poolToken'),
      value: formatPoolTokenLabel(formValues.poolToken, poolTokens, chainDefinition.nativeToken.symbol),
    },
    {
      key: 'rewardToken',
      label: t('tokenDividendCreation.successSummary.rewardToken'),
      value: formValues.isSameTokenDividend
        ? t('tokenDividendCreation.modes.sameToken')
        : selectedRewardToken?.symbol ?? formatAddressLabel(formValues.dividendToken, chainDefinition.nativeToken.symbol),
    },
    {
      key: 'mintEnabled',
      label: t('tokenDividendCreation.successSummary.mintEnabled'),
      value: formatBooleanSetting(formValues.mintEnabled, t),
    },
    {
      key: 'manualTradingEnable',
      label: t('tokenDividendCreation.successSummary.manualTradingEnable'),
      value: formatBooleanSetting(formValues.manualTradingEnable, t),
    },
    {
      key: 'whitelistEnabled',
      label: t('tokenDividendCreation.successSummary.whitelistEnabled'),
      value: formatBooleanSetting(formValues.whitelistEnabled, t),
    },
    {
      key: 'blacklistEnabled',
      label: t('tokenDividendCreation.successSummary.blacklistEnabled'),
      value: formatBooleanSetting(formValues.blacklistEnabled, t),
    },
  ]

  const detailItems = [
    {
      key: 'receiveAddress',
      label: t('tokenDividendCreation.successSummary.receiveAddress'),
      value: result.receiveAddress,
      link: getExplorerUrl(chainDefinition, 'address', result.receiveAddress),
      copyLabel: 'copy receive address',
    },
    {
      key: 'fundAddress',
      label: t('tokenDividendCreation.successSummary.fundAddress'),
      value: result.fundAddress,
      link: getExplorerUrl(chainDefinition, 'address', result.fundAddress),
      copyLabel: 'copy fund address',
    },
    {
      key: 'tokenAddress',
      label: t('tokenDividendCreation.successSummary.tokenAddress'),
      value: result.tokenAddress,
      link: getExplorerUrl(chainDefinition, 'token', result.tokenAddress),
      copyLabel: 'copy token address',
    },
    {
      key: 'txHash',
      label: t('tokenDividendCreation.successSummary.txHash'),
      value: result.txHash,
      link: getExplorerUrl(chainDefinition, 'hash', result.txHash),
      copyLabel: 'copy tx hash',
    },
  ]

  return (
    <section className="token-success-section">
      <div className="token-success-copy">
        <h3>{t('tokenDividendCreation.successSummary.title')}</h3>
        <p>{t('tokenDividendCreation.successSummary.description')}</p>
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

      {manageConsoleUrl ? (
        <div className="summary-actions">
          <Button type="primary" href={manageConsoleUrl}>
            {t('tokenDividendCreation.successSummary.openConsole')}
          </Button>
        </div>
      ) : null}
    </section>
  )
}

function formatSupply(value: string) {
  if (!value) {
    return ''
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatGroupTax(formValues: TokenDividendFormValues, prefix: 'buy' | 'sell' | 'transfer') {
  const parts = [
    formValues[`${prefix}MarketingTax`],
    formValues[`${prefix}ReflowTax`],
    formValues[`${prefix}BurnTax`],
    formValues[`${prefix}DividendTax`],
  ]

  const total = parts.reduce((sum, value) => sum + Number(value || '0'), 0)
  return formatTaxPercent(String(total))
}

function formatBooleanSetting(value: boolean, t: (key: string) => string) {
  return value ? t('tokenDividendCreation.successSummary.enabled') : t('tokenDividendCreation.successSummary.disabled')
}
