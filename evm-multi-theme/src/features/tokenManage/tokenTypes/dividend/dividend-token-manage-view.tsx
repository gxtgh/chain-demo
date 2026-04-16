import type { ReactNode } from 'react'
import {
  DeploymentUnitOutlined,
  FireOutlined,
  FundOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, InputNumber, Segmented, Tag, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import { useRouteContext } from '@/app/use-route-context'
import { OperationStatus } from '@/components/common/operation-status'
import { CopyButton } from '@/components/common/copy-button'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import { formatText } from '@/utils'
import { getExplorerUrl } from '@/config/chains'
import { calcDividendTaxCategoryTotal, calcDividendTaxGrandTotal, DIVIDEND_TAX_PREFIXES, DIVIDEND_TAX_SUFFIXES, toBasisPoints } from '@/features/tokenDividendCreation/business/tax'
import { queryWithdrawableDividend } from '../../business/tokenManageService'
import { useTokenManageActionRunner } from '../../business/useTokenManageActionRunner'
import {
  formatAddressText,
  formatBasisPoints,
  normalizeTokenAddress,
  resolveTokenManageRole,
  type DividendTokenManageInfo,
  type OverviewCardModel,
} from '../../business/model'

type AddressListMode = 'whitelist' | 'blacklist'
type AddressListAction = 'add' | 'remove'

export function DividendTokenManageView({
  chainDefinition,
  info,
  role,
  isConnected,
  t,
  runner,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: DividendTokenManageInfo
  role: ReturnType<typeof resolveTokenManageRole>
  isConnected: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  runner: ReturnType<typeof useTokenManageActionRunner>
}) {
  const canManage = role === 'owner'
  const canViewFundBadge = role === 'fund'
  const overviewCards = useMemo(() => buildOverviewCards(info, t), [info, t])
  const sectionNavItems = [
    { key: 'supplyDividend', label: t('tokenManage.sections.supplyDividend.title') },
    { key: 'listsPermissions', label: t('tokenManage.sections.listsPermissions.title') },
    { key: 'tradingFees', label: t('tokenManage.sections.tradingFees.title') },
    { key: 'danger', label: t('tokenManage.sections.danger.title') },
  ]

  return (
    <>
      <section className="surface-card token-manage-header-card">
        <div className="permission-hero">
          <div className="permission-hero-layout manage-hero-layout">
            <div className="permission-hero-badge">
              <div className="token-section-icon">
                <DeploymentUnitOutlined />
              </div>
            </div>
            <div className="permission-hero-content">
              <div className="manage-header-topline">
                <div className="token-section-copy">
                  <h2>{`${info.name} (${info.symbol})`}</h2>
                </div>
                <div className="permission-highlight-row manage-header-tags">
                  <span className="permission-highlight-pill">{t('tokenManage.header.typeDividend')}</span>
                  <span className={`status-chip ${info.tradingEnabled ? 'success' : 'warning'}`}>
                    {info.tradingEnabled ? t('tokenManage.header.tradingEnabled') : t('tokenManage.header.tradingClosed')}
                  </span>
                  <span className={`status-chip ${info.isSameTokenDividend ? 'success' : 'default'}`}>
                    {info.isSameTokenDividend ? t('tokenManage.header.sameTokenDividend') : t('tokenManage.header.externalTokenDividend')}
                  </span>
                  <span className={`status-chip ${role === 'owner' ? 'success' : role === 'fund' ? 'default' : 'warning'}`}>
                    {role === 'owner'
                      ? t('tokenManage.header.roleOwner')
                      : canViewFundBadge
                        ? t('tokenManage.header.roleFund')
                        : t('tokenManage.header.roleViewer')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-stat-grid manage-header-stats">
          <StatCard label={t('tokenManage.header.decimals')} value={String(info.decimals)} />
          <StatCard label={t('tokenManage.header.totalSupply')} value={info.totalSupplyDisplay} />
          <StatCard label={t('tokenManage.header.rewardToken')} value={info.dividendTokenInfo?.symbol ?? formatAddressText(info.dividendToken)} />
          <StatCard label={t('tokenManage.header.poolToken')} value={info.basePoolTokenInfo?.symbol ?? formatAddressText(info.basePoolToken)} />
          <StatCard label={t('tokenManage.header.mainPair')} value={formatAddressText(info.mainPair)} />
        </div>

        <div className="summary-detail-list manage-header-addresses">
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.contractAddress')} value={info.address} />
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.ownerAddress')} value={info.owner} />
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.fundAddress')} value={info.fundAddress} />
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.routerAddress')} value={info.swapRouter} />
        </div>
      </section>

      <section className="surface-card token-manage-overview-card">
        <div className="token-section-copy">
          <h3>{t('tokenManage.overview.title')}</h3>
          <p>{t('tokenManage.overview.description')}</p>
        </div>
        <div className="manage-overview-grid">
          {overviewCards.map((card) => (
            <article className={`manage-overview-item ${card.tone ?? 'default'}`} key={card.key}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              {card.description ? <p>{card.description}</p> : null}
            </article>
          ))}
        </div>
      </section>

      {!isConnected || !canManage ? (
        <Alert
          className="manage-permission-alert"
          type="info"
          showIcon
          message={
            !isConnected
              ? t('tokenManage.permission.connectWallet')
              : t('tokenManage.permission.ownerOnly', { address: formatAddressText(info.owner) })
          }
        />
      ) : null}

      <section className="surface-card manage-section-nav-card">
        <div className="manage-section-nav">
          {sectionNavItems.map((item) => (
            <button
              key={item.key}
              className="manage-section-nav-chip"
              type="button"
              onClick={() => {
                const target = document.getElementById(`manage-section-${item.key}`)
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <SectionBlock
        sectionId="supplyDividend"
        icon={<WalletOutlined />}
        title={t('tokenManage.sections.supplyDividend.title')}
        description={t('tokenManage.sections.supplyDividend.description')}
      >
        <div className="manage-section-grid">
          <MintCard info={info} t={t} onSubmit={(recipient, amount) => {
            runner.runAction({
              key: 'mint',
              title: t('tokenManage.actions.mint.title'),
              functionName: 'mint',
              args: [recipient, amount],
              successMessage: t('tokenManage.actions.mint.success'),
              failureMessage: t('tokenManage.actions.mint.failed'),
            })
          }} disabled={!canManage || runner.currentActionKey === 'mint'} />

          <ThresholdsCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />

          <DividendQueryCard
            chainDefinition={chainDefinition}
            info={info}
            t={t}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        sectionId="listsPermissions"
        icon={<SafetyCertificateOutlined />}
        title={t('tokenManage.sections.listsPermissions.title')}
        description={t('tokenManage.sections.listsPermissions.description')}
      >
        <div className="manage-section-grid">
          <AddressListCard
            chainDefinition={chainDefinition}
            info={info}
            mode="whitelist"
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
          <AddressListCard
            chainDefinition={chainDefinition}
            info={info}
            mode="blacklist"
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
          <TransferOwnershipCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        sectionId="tradingFees"
        icon={<FundOutlined />}
        title={t('tokenManage.sections.tradingFees.title')}
        description={t('tokenManage.sections.tradingFees.description')}
      >
        <div className="manage-section-grid">
          <TaxSettingsCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
          <FundAddressCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
          <TradingControlCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
        </div>
      </SectionBlock>

      <SectionBlock
        sectionId="danger"
        icon={<FireOutlined />}
        title={t('tokenManage.sections.danger.title')}
        description={t('tokenManage.sections.danger.description')}
        tone="danger"
      >
        <DangerZoneCard
          info={info}
          t={t}
          disabled={!canManage}
          loadingKey={runner.currentActionKey}
          onRunAction={(config) => runner.runAction(config)}
        />
      </SectionBlock>

      <OperationStatus
        open={runner.open}
        title={runner.currentTitle || t('tokenManage.progressTitle')}
        step={runner.step}
        steps={[
          {
            id: 1,
            text: t('tokenManage.progress.waitingWallet'),
            errorText: t('tokenManage.progress.waitingWalletFailed'),
          },
          {
            id: 2,
            text: t('tokenManage.progress.pending'),
            errorText: t('tokenManage.progress.pendingFailed'),
          },
          {
            id: 3,
            text: t('tokenManage.progress.completed'),
            errorText: t('tokenManage.progress.failed'),
          },
        ]}
        cancelBtnShow={false}
        onClose={runner.closeStatus}
      />
    </>
  )
}

function SectionBlock({
  sectionId,
  icon,
  title,
  description,
  children,
  tone = 'default',
}: {
  sectionId: string
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
  tone?: 'default' | 'danger'
}) {
  return (
    <section id={`manage-section-${sectionId}`} className={`surface-card manage-section-card ${tone}`}>
      <div className="manage-section-head">
        <div className="manage-section-icon">{icon}</div>
        <div className="token-section-copy">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="summary-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function AddressCard({
  chainDefinition,
  label,
  value,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  label: string
  value: string
}) {
  const explorerUrl = getExplorerUrl(chainDefinition, 'address', value)

  return (
    <div className="summary-detail-card">
      <span>{label}</span>
      <div className="result-inline-value">
        <a className="value-link" href={explorerUrl} target="_blank" rel="noreferrer">
          {formatText(value)}
        </a>
        <CopyButton ariaLabel={label} value={value} />
      </div>
    </div>
  )
}

function MintCard({
  info,
  t,
  onSubmit,
  disabled,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  onSubmit: (recipient: string, amount: bigint) => void
  disabled: boolean
}) {
  const [recipient, setRecipient] = useState(info.receiveAddress)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    setRecipient(info.receiveAddress)
  }, [info.receiveAddress])

  function handleSubmit() {
    if (!recipient || !isValidAddress(recipient)) {
      message.warning(t('tokenManage.errors.invalidAddress'))
      return
    }

    if (!amount.trim()) {
      message.warning(t('tokenManage.errors.mintAmountRequired'))
      return
    }

    let amountWei: bigint
    try {
      amountWei = parseUnits(amount, info.decimals)
    } catch {
      message.warning(t('tokenManage.errors.invalidAmount'))
      return
    }

    if (amountWei <= 0n) {
      message.warning(t('tokenManage.errors.invalidAmount'))
      return
    }

    if (amountWei > info.remainingMintable) {
      message.warning(t('tokenManage.errors.mintExceedsCap'))
      return
    }

    onSubmit(recipient, amountWei)
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.mint.title')}</h4>
        <p>{t('tokenManage.actions.mint.description')}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.actions.mint.cap')}</span>
        <strong>{info.initialSupplyDisplay}</strong>
        <span>{t('tokenManage.actions.mint.minted')}</span>
        <strong>{info.totalMintedDisplay}</strong>
        <span>{t('tokenManage.actions.mint.remaining')}</span>
        <strong>{info.remainingMintableDisplay}</strong>
      </div>
      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenManage.actions.mint.recipient')} tooltip={t('tokenManage.actions.mint.recipientTip')} />
          <Input className="token-form-input" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
        </label>
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenManage.actions.mint.amount')} tooltip={t('tokenManage.actions.mint.amountTip')} />
          <Input className="token-form-input" value={amount} onChange={(event) => setAmount(event.target.value)} suffix={info.symbol} />
        </label>
      </div>
      <Button type="primary" disabled={disabled || !info.mintEnabled} onClick={handleSubmit}>
        {t('tokenManage.actions.mint.confirm')}
      </Button>
      {!info.mintEnabled ? <small className="field-error">{t('tokenManage.errors.mintDisabled')}</small> : null}
    </article>
  )
}

function ThresholdsCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [minHolding, setMinHolding] = useState(info.minHoldingForDividendDisplay)
  const [threshold, setThreshold] = useState(info.dividendTriggerThresholdDisplay)
  const [gasLimit, setGasLimit] = useState(String(info.autoProcessGasLimit))
  const [processGasLimit, setProcessGasLimit] = useState(String(info.autoProcessGasLimit))

  useEffect(() => {
    setMinHolding(info.minHoldingForDividendDisplay)
    setThreshold(info.dividendTriggerThresholdDisplay)
    setGasLimit(String(info.autoProcessGasLimit))
    setProcessGasLimit(String(info.autoProcessGasLimit))
  }, [info.autoProcessGasLimit, info.dividendTriggerThresholdDisplay, info.minHoldingForDividendDisplay])

  function runAmountAction({
    key,
    functionName,
    value,
    successMessage,
    failureMessage,
    title,
  }: {
    key: string
    functionName: string
    value: string
    successMessage: string
    failureMessage: string
    title: string
  }) {
    let amount: bigint
    try {
      amount = parseUnits(value, info.decimals)
    } catch {
      message.warning(t('tokenManage.errors.invalidAmount'))
      return
    }
    if (amount <= 0n) {
      message.warning(t('tokenManage.errors.invalidAmount'))
      return
    }
    if (amount >= info.totalSupply) {
      message.warning(t('tokenManage.errors.valueMustBeLessThanSupply'))
      return
    }
    onRunAction({ key, title, functionName, args: [amount], successMessage, failureMessage })
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.thresholds.title')}</h4>
        <p>{t('tokenManage.actions.thresholds.description')}</p>
      </div>
      <div className="manage-field-stack">
        <InlineActionRow
          label={t('tokenManage.actions.thresholds.minHolding')}
          currentValue={info.minHoldingForDividendDisplay}
          control={
            <Input className="token-form-input" value={minHolding} onChange={(event) => setMinHolding(event.target.value)} />
          }
          buttonText={t('tokenManage.actions.thresholds.updateMinHolding')}
          disabled={disabled || loadingKey === 'minHolding'}
          onSubmit={() => runAmountAction({
            key: 'minHolding',
            functionName: 'setMinHoldingForDividend',
            value: minHolding,
            title: t('tokenManage.actions.thresholds.updateMinHolding'),
            successMessage: t('tokenManage.actions.thresholds.minHoldingSuccess'),
            failureMessage: t('tokenManage.actions.thresholds.minHoldingFailed'),
          })}
        />
        <InlineActionRow
          label={t('tokenManage.actions.thresholds.triggerThreshold')}
          currentValue={info.dividendTriggerThresholdDisplay}
          control={
            <Input className="token-form-input" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          }
          buttonText={t('tokenManage.actions.thresholds.updateTriggerThreshold')}
          disabled={disabled || loadingKey === 'triggerThreshold'}
          onSubmit={() => runAmountAction({
            key: 'triggerThreshold',
            functionName: 'setDividendTriggerThreshold',
            value: threshold,
            title: t('tokenManage.actions.thresholds.updateTriggerThreshold'),
            successMessage: t('tokenManage.actions.thresholds.triggerThresholdSuccess'),
            failureMessage: t('tokenManage.actions.thresholds.triggerThresholdFailed'),
          })}
        />
        <InlineActionRow
          label={t('tokenManage.actions.thresholds.autoGas')}
          currentValue={String(info.autoProcessGasLimit)}
          control={
            <InputNumber
              className="token-form-number"
              stringMode
              min="1"
              precision={0}
              style={{ width: '100%' }}
              value={gasLimit}
              onChange={(value) => setGasLimit(String(value ?? ''))}
            />
          }
          buttonText={t('tokenManage.actions.thresholds.updateAutoGas')}
          disabled={disabled || loadingKey === 'autoGas'}
          onSubmit={() => {
            if (!gasLimit.trim() || !/^\d+$/.test(gasLimit) || BigInt(gasLimit) <= 0n) {
              message.warning(t('tokenManage.errors.invalidGasLimit'))
              return
            }
            onRunAction({
              key: 'autoGas',
              title: t('tokenManage.actions.thresholds.updateAutoGas'),
              functionName: 'setAutoProcessGasLimit',
              args: [BigInt(gasLimit)],
              successMessage: t('tokenManage.actions.thresholds.autoGasSuccess'),
              failureMessage: t('tokenManage.actions.thresholds.autoGasFailed'),
            })
          }}
        />
        <InlineActionRow
          label={t('tokenManage.actions.thresholds.manualProcess')}
          currentValue={info.pendingDividendsDisplay}
          control={
            <InputNumber
              className="token-form-number"
              stringMode
              min="1"
              precision={0}
              style={{ width: '100%' }}
              value={processGasLimit}
              onChange={(value) => setProcessGasLimit(String(value ?? ''))}
            />
          }
          buttonText={t('tokenManage.actions.thresholds.processDividend')}
          disabled={disabled || loadingKey === 'processDividend'}
          onSubmit={() => {
            if (!processGasLimit.trim() || !/^\d+$/.test(processGasLimit) || BigInt(processGasLimit) <= 0n) {
              message.warning(t('tokenManage.errors.invalidGasLimit'))
              return
            }
            onRunAction({
              key: 'processDividend',
              title: t('tokenManage.actions.thresholds.processDividend'),
              functionName: 'processDividend',
              args: [BigInt(processGasLimit)],
              successMessage: t('tokenManage.actions.thresholds.processDividendSuccess'),
              failureMessage: t('tokenManage.actions.thresholds.processDividendFailed'),
            })
          }}
        />
      </div>
    </article>
  )
}

function DividendQueryCard({
  chainDefinition,
  info,
  t,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const [queryAddress, setQueryAddress] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleQuery() {
    if (!queryAddress || !isValidAddress(queryAddress)) {
      message.warning(t('tokenManage.errors.invalidAddress'))
      return
    }

    setLoading(true)
    setResult('')
    try {
      const queried = await queryWithdrawableDividend({
        chainDefinition,
        tokenAddress: info.address,
        account: queryAddress,
        rewardDecimals: info.dividendTokenInfo?.decimals ?? info.decimals,
      })
      const suffix = info.dividendTokenInfo?.symbol ? ` ${info.dividendTokenInfo.symbol}` : ''
      setResult(`${queried.displayAmount}${suffix}`)
    } catch {
      message.error(t('tokenManage.actions.query.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.query.title')}</h4>
        <p>{t('tokenManage.actions.query.description')}</p>
      </div>
      <label className="field">
        <FieldLabelWithTooltip label={t('tokenManage.actions.query.address')} tooltip={t('tokenManage.actions.query.addressTip')} />
        <Input className="token-form-input" value={queryAddress} onChange={(event) => setQueryAddress(event.target.value)} />
      </label>
      {result ? (
        <div className="manage-query-result">
          <span>{t('tokenManage.actions.query.result')}</span>
          <strong>{result}</strong>
        </div>
      ) : null}
      <Button type="default" onClick={handleQuery} disabled={loading}>
        {loading ? t('tokenManage.actions.query.loading') : t('tokenManage.actions.query.confirm')}
      </Button>
    </article>
  )
}

function AddressListCard({
  chainDefinition,
  info,
  mode,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: DividendTokenManageInfo
  mode: AddressListMode
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [operation, setOperation] = useState<AddressListAction>('add')
  const [accountAddress, setAccountAddress] = useState('')
  const list = mode === 'whitelist' ? info.whitelistAddresses : info.blacklistAddresses
  const enabled = mode === 'whitelist' ? info.whitelistEnabled : info.blacklistEnabled
  const protectedSet = new Set(info.protectedAddresses.map((item) => normalizeTokenAddress(item)))
  const protectedItems = mode === 'whitelist' ? list.filter((item) => protectedSet.has(normalizeTokenAddress(item))) : []
  const editableItems = mode === 'whitelist' ? list.filter((item) => !protectedSet.has(normalizeTokenAddress(item))) : list

  function handleSubmit() {
    if (!accountAddress || !isValidAddress(accountAddress)) {
      message.warning(t('tokenManage.errors.invalidAddress'))
      return
    }

    const normalized = normalizeTokenAddress(accountAddress)
    const exists = list.some((item) => normalizeTokenAddress(item) === normalized)

    if (operation === 'add') {
      if (!enabled) {
        message.warning(t('tokenManage.errors.listDisabledAdd'))
        return
      }
      if (exists) {
        message.warning(t('tokenManage.errors.addressAlreadyInList'))
        return
      }
    } else {
      if (!exists) {
        message.warning(t('tokenManage.errors.addressNotInList'))
        return
      }
    }

    onRunAction({
      key: `${mode}-${operation}`,
      title: t(`tokenManage.actions.${mode}.title`),
      functionName: 'batchSetList',
      args: [mode === 'whitelist', [accountAddress], operation === 'add'],
      successMessage: t(`tokenManage.actions.${mode}.${operation}Success`),
      failureMessage: t(`tokenManage.actions.${mode}.${operation}Failed`),
    })
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t(`tokenManage.actions.${mode}.title`)}</h4>
        <p>{t(`tokenManage.actions.${mode}.description`)}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.list.status')}</span>
        <strong>{enabled ? t('tokenManage.list.enabled') : t('tokenManage.list.disabled')}</strong>
        <span>{t('tokenManage.list.count')}</span>
        <strong>{String(list.length)}</strong>
      </div>
      {mode === 'whitelist' && protectedItems.length > 0 ? (
        <Alert
          type="info"
          showIcon
          message={t('tokenManage.actions.whitelist.protectedNotice', { count: protectedItems.length })}
        />
      ) : null}
      <div className="manage-inline-form">
        <Segmented
          value={operation}
          options={[
            { label: t('tokenManage.list.add'), value: 'add' },
            { label: t('tokenManage.list.remove'), value: 'remove' },
          ]}
          onChange={(value) => setOperation(value as AddressListAction)}
        />
        <Input className="token-form-input" value={accountAddress} onChange={(event) => setAccountAddress(event.target.value)} />
        <Button type="primary" disabled={disabled || loadingKey === `${mode}-${operation}`} onClick={handleSubmit}>
          {t(`tokenManage.actions.${mode}.${operation}`)}
        </Button>
      </div>
      <div className="manage-address-list">
        {(mode === 'whitelist' ? [...protectedItems, ...editableItems] : editableItems).map((item) => (
          <AddressTag
            key={item}
            chainDefinition={chainDefinition}
            address={item}
            protectedTag={protectedSet.has(normalizeTokenAddress(item))}
            protectedLabel={t('tokenManage.list.protected')}
          />
        ))}
        {!list.length ? <span className="manage-address-empty">{t('tokenManage.list.empty')}</span> : null}
      </div>
    </article>
  )
}

function TransferOwnershipCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [nextOwner, setNextOwner] = useState('')

  return (
    <article className="manage-operation-card manage-operation-card-wide">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.transferOwnership.title')}</h4>
        <p>{t('tokenManage.actions.transferOwnership.description')}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.actions.transferOwnership.current')}</span>
        <strong>{formatAddressText(info.owner)}</strong>
      </div>
      <label className="field">
        <FieldLabelWithTooltip label={t('tokenManage.actions.transferOwnership.nextOwner')} tooltip={t('tokenManage.actions.transferOwnership.nextOwnerTip')} />
        <Input className="token-form-input" value={nextOwner} onChange={(event) => setNextOwner(event.target.value)} />
      </label>
      <Button
        type="primary"
        disabled={disabled || loadingKey === 'transferOwnership'}
        onClick={() => {
          if (!nextOwner || !isValidAddress(nextOwner)) {
            message.warning(t('tokenManage.errors.invalidAddress'))
            return
          }
          onRunAction({
            key: 'transferOwnership',
            title: t('tokenManage.actions.transferOwnership.title'),
            functionName: 'transferOwnership',
            args: [nextOwner],
            successMessage: t('tokenManage.actions.transferOwnership.success'),
            failureMessage: t('tokenManage.actions.transferOwnership.failed'),
          })
        }}
      >
        {t('tokenManage.actions.transferOwnership.confirm')}
      </Button>
    </article>
  )
}

function TaxSettingsCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => buildTaxFormState(info))

  useEffect(() => {
    setFormValues(buildTaxFormState(info))
  }, [info])

  function updateField(key: string, value: string) {
    setFormValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit() {
    const invalidField = Object.values(formValues).find((item) => item.trim() && !/^\d+(\.\d{1,2})?$/.test(item))
    if (invalidField !== undefined) {
      message.warning(t('tokenManage.errors.taxInputInvalid'))
      return
    }
    const exceededCategory = DIVIDEND_TAX_PREFIXES.find((prefix) => calcDividendTaxCategoryTotal(formValues as never, prefix) > 25)
    if (exceededCategory) {
      message.warning(t('tokenManage.errors.taxCategoryExceeded', { type: t(`tokenManage.taxGroups.${exceededCategory}`), max: 25 }))
      return
    }
    if (calcDividendTaxGrandTotal(formValues as never) > 75) {
      message.warning(t('tokenManage.errors.taxGrandTotalExceeded', { max: 75 }))
      return
    }

    onRunAction({
      key: 'taxRates',
      title: t('tokenManage.actions.taxRates.title'),
      functionName: 'setTaxRates',
      args: [
        buildTaxRateArgs(formValues, 'buy'),
        buildTaxRateArgs(formValues, 'sell'),
        buildTaxRateArgs(formValues, 'transfer'),
      ],
      successMessage: t('tokenManage.actions.taxRates.success'),
      failureMessage: t('tokenManage.actions.taxRates.failed'),
    })
  }

  return (
    <article className="manage-operation-card manage-operation-card-wide">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.taxRates.title')}</h4>
        <p>{t('tokenManage.actions.taxRates.description')}</p>
      </div>
      <div className="tax-group-grid manage-tax-group-grid">
        {DIVIDEND_TAX_PREFIXES.map((prefix) => (
          <section className="dividend-tax-card" key={prefix}>
            <div className="dividend-tax-card-head">
              <div>
                <strong>{t(`tokenManage.taxGroups.${prefix}`)}</strong>
                <p>{t(`tokenManage.taxGroupDescriptions.${prefix}`)}</p>
              </div>
              <span className="tax-total-pill">{calcDividendTaxCategoryTotal(formValues as never, prefix)}%</span>
            </div>
            <div className="dividend-tax-field-grid">
              {DIVIDEND_TAX_SUFFIXES.map((suffix) => {
                const key = `${prefix}${suffix}`
                return (
                  <label className="field" key={key}>
                    <FieldLabelWithTooltip
                      label={t(`tokenManage.taxFields.${suffix}`)}
                      tooltip={t(`tokenManage.taxTooltips.${suffix}`)}
                    />
                    <Input
                      className="token-form-input tax-percent-input"
                      suffix="%"
                      value={formValues[key]}
                      onChange={(event) => updateField(key, event.target.value)}
                    />
                  </label>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="tax-total-bar">
        <span>{t('tokenManage.actions.taxRates.total')}</span>
        <strong>{calcDividendTaxGrandTotal(formValues as never)}%</strong>
      </div>
      <Button type="primary" disabled={disabled || loadingKey === 'taxRates'} onClick={handleSubmit}>
        {t('tokenManage.actions.taxRates.confirm')}
      </Button>
    </article>
  )
}

function FundAddressCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [fundAddress, setFundAddress] = useState('')

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.fundAddress.title')}</h4>
        <p>{t('tokenManage.actions.fundAddress.description')}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.actions.fundAddress.current')}</span>
        <strong>{formatAddressText(info.fundAddress)}</strong>
      </div>
      <label className="field">
        <FieldLabelWithTooltip label={t('tokenManage.actions.fundAddress.next')} tooltip={t('tokenManage.actions.fundAddress.nextTip')} />
        <Input className="token-form-input" value={fundAddress} onChange={(event) => setFundAddress(event.target.value)} />
      </label>
      <Button
        type="primary"
        disabled={disabled || loadingKey === 'fundAddress'}
        onClick={() => {
          if (!fundAddress || !isValidAddress(fundAddress)) {
            message.warning(t('tokenManage.errors.invalidAddress'))
            return
          }
          onRunAction({
            key: 'fundAddress',
            title: t('tokenManage.actions.fundAddress.title'),
            functionName: 'setFundAddress',
            args: [fundAddress],
            successMessage: t('tokenManage.actions.fundAddress.success'),
            failureMessage: t('tokenManage.actions.fundAddress.failed'),
          })
        }}
      >
        {t('tokenManage.actions.fundAddress.confirm')}
      </Button>
    </article>
  )
}

function TradingControlCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const [killBlockCount, setKillBlockCount] = useState(String(info.killBlockCount))

  useEffect(() => {
    setKillBlockCount(String(info.killBlockCount))
  }, [info.killBlockCount])

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.trading.title')}</h4>
        <p>{t('tokenManage.actions.trading.description')}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.actions.trading.manualMode')}</span>
        <strong>{info.manualTradingEnable ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled')}</strong>
        <span>{t('tokenManage.actions.trading.status')}</span>
        <strong>{info.tradingEnabled ? t('tokenManage.header.tradingEnabled') : t('tokenManage.header.tradingClosed')}</strong>
      </div>
      <InlineActionRow
        label={t('tokenManage.actions.trading.killBlock')}
        currentValue={String(info.killBlockCount)}
        control={
          <InputNumber
            className="token-form-number"
            stringMode
            min="0"
            precision={0}
            style={{ width: '100%' }}
            value={killBlockCount}
            onChange={(value) => setKillBlockCount(String(value ?? ''))}
          />
        }
        buttonText={t('tokenManage.actions.trading.updateKillBlock')}
        disabled={disabled || loadingKey === 'killBlock'}
        onSubmit={() => {
          if (!/^\d+$/.test(killBlockCount)) {
            message.warning(t('tokenManage.errors.invalidKillBlock'))
            return
          }
          onRunAction({
            key: 'killBlock',
            title: t('tokenManage.actions.trading.title'),
            functionName: 'setKillBlockCount',
            args: [BigInt(killBlockCount)],
            successMessage: t('tokenManage.actions.trading.killBlockSuccess'),
            failureMessage: t('tokenManage.actions.trading.killBlockFailed'),
          })
        }}
      />
      <Button
        type="primary"
        disabled={disabled || loadingKey === 'enableTrading' || !info.manualTradingEnable || info.tradingEnabled}
        onClick={() =>
          onRunAction({
            key: 'enableTrading',
            title: t('tokenManage.actions.trading.enableTrading'),
            functionName: 'enableTrading',
            args: [],
            successMessage: t('tokenManage.actions.trading.enableTradingSuccess'),
            failureMessage: t('tokenManage.actions.trading.enableTradingFailed'),
          })
        }
      >
        {t('tokenManage.actions.trading.enableTrading')}
      </Button>
      {!info.manualTradingEnable ? <small className="field-error">{t('tokenManage.actions.trading.manualTradingDisabled')}</small> : null}
    </article>
  )
}

function DangerZoneCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: DividendTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: {
    key: string
    title: string
    functionName: string
    args: unknown[]
    successMessage: string
    failureMessage: string
  }) => void
}) {
  const actions = [
    {
      key: 'disableMint',
      label: t('tokenManage.danger.disableMint'),
      enabled: info.mintEnabled,
      functionName: 'disableMintForever',
      successMessage: t('tokenManage.danger.disableMintSuccess'),
      failureMessage: t('tokenManage.danger.disableMintFailed'),
    },
    {
      key: 'disableWhitelist',
      label: t('tokenManage.danger.disableWhitelist'),
      enabled: info.whitelistEnabled,
      functionName: 'setWhitelistEnabled',
      args: [false],
      successMessage: t('tokenManage.danger.disableWhitelistSuccess'),
      failureMessage: t('tokenManage.danger.disableWhitelistFailed'),
    },
    {
      key: 'disableBlacklist',
      label: t('tokenManage.danger.disableBlacklist'),
      enabled: info.blacklistEnabled,
      functionName: 'setBlacklistEnabled',
      args: [false],
      successMessage: t('tokenManage.danger.disableBlacklistSuccess'),
      failureMessage: t('tokenManage.danger.disableBlacklistFailed'),
    },
    {
      key: 'renounceOwnership',
      label: t('tokenManage.danger.renounceOwnership'),
      enabled: normalizeTokenAddress(info.owner) !== normalizeTokenAddress('0x0000000000000000000000000000000000000000'),
      functionName: 'renounceOwnership',
      successMessage: t('tokenManage.danger.renounceOwnershipSuccess'),
      failureMessage: t('tokenManage.danger.renounceOwnershipFailed'),
    },
  ]

  return (
    <article className="manage-danger-grid">
      <Alert
        type="warning"
        showIcon
        message={t('tokenManage.danger.warning')}
        description={t('tokenManage.danger.description')}
      />
      {actions.map((action) => (
        <div className="manage-danger-item" key={action.key}>
          <div>
            <strong>{action.label}</strong>
            <p>{action.enabled ? t('tokenManage.danger.available') : t('tokenManage.danger.unavailable')}</p>
          </div>
          <Button
            danger
            disabled={disabled || loadingKey === action.key || !action.enabled}
            onClick={() =>
              onRunAction({
                key: action.key,
                title: action.label,
                functionName: action.functionName,
                args: action.args ?? [],
                successMessage: action.successMessage,
                failureMessage: action.failureMessage,
              })
            }
          >
            {action.label}
          </Button>
        </div>
      ))}
    </article>
  )
}

function InlineActionRow({
  label,
  currentValue,
  control,
  buttonText,
  disabled,
  onSubmit,
}: {
  label: string
  currentValue: string
  control: ReactNode
  buttonText: string
  disabled: boolean
  onSubmit: () => void
}) {
  return (
    <div className="manage-inline-action-row">
      <div className="manage-inline-action-head">
        <strong>{label}</strong>
        <span>{currentValue}</span>
      </div>
      <div className="manage-inline-action-controls">
        <div className="manage-inline-action-input">{control}</div>
        <Button type="default" disabled={disabled} onClick={onSubmit}>
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

function AddressTag({
  chainDefinition,
  address,
  protectedTag = false,
  protectedLabel,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  address: string
  protectedTag?: boolean
  protectedLabel: string
}) {
  return (
    <span className={`manage-address-tag ${protectedTag ? 'protected' : ''}`}>
      <a href={getExplorerUrl(chainDefinition, 'address', address)} target="_blank" rel="noreferrer">
        {formatAddressText(address)}
      </a>
      {protectedTag ? <Tag color="gold">{protectedLabel}</Tag> : null}
      <CopyButton ariaLabel={address} value={address} />
    </span>
  )
}

function buildOverviewCards(info: DividendTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): OverviewCardModel[] {
  return [
    {
      key: 'owner',
      label: t('tokenManage.overviewCards.owner'),
      value: normalizeTokenAddress(info.owner) === normalizeTokenAddress('0x0000000000000000000000000000000000000000')
        ? t('tokenManage.overviewCards.renounced')
        : t('tokenManage.overviewCards.active'),
      tone: normalizeTokenAddress(info.owner) === normalizeTokenAddress('0x0000000000000000000000000000000000000000') ? 'danger' : 'success',
    },
    {
      key: 'mint',
      label: t('tokenManage.overviewCards.mint'),
      value: info.mintEnabled ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled'),
      tone: info.mintEnabled ? 'success' : 'warning',
    },
    {
      key: 'blacklist',
      label: t('tokenManage.overviewCards.blacklist'),
      value: info.blacklistEnabled ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled'),
      tone: info.blacklistEnabled ? 'success' : 'warning',
    },
    {
      key: 'whitelist',
      label: t('tokenManage.overviewCards.whitelist'),
      value: info.whitelistEnabled ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled'),
      tone: info.whitelistEnabled ? 'success' : 'warning',
    },
    {
      key: 'pendingDividends',
      label: t('tokenManage.overviewCards.pendingDividends'),
      value: info.pendingDividendsDisplay,
    },
    {
      key: 'distributed',
      label: t('tokenManage.overviewCards.totalDistributed'),
      value: info.totalDividendsDistributedDisplay,
    },
    {
      key: 'minHolding',
      label: t('tokenManage.overviewCards.minHolding'),
      value: info.minHoldingForDividendDisplay,
    },
    {
      key: 'triggerThreshold',
      label: t('tokenManage.overviewCards.triggerThreshold'),
      value: info.dividendTriggerThresholdDisplay,
    },
    {
      key: 'autoProcessGas',
      label: t('tokenManage.overviewCards.autoGas'),
      value: String(info.autoProcessGasLimit),
    },
    {
      key: 'rewardToken',
      label: t('tokenManage.overviewCards.rewardToken'),
      value: info.dividendTokenInfo?.symbol ?? formatAddressText(info.dividendToken),
    },
  ]
}

function buildTaxFormState(info: DividendTokenManageInfo) {
  return {
    buyMarketingTax: formatBasisPoints(info.buyFundFee),
    buyReflowTax: formatBasisPoints(info.buyLPFee),
    buyBurnTax: formatBasisPoints(info.buyBurnFee),
    buyDividendTax: formatBasisPoints(info.buyDividendFee),
    sellMarketingTax: formatBasisPoints(info.sellFundFee),
    sellReflowTax: formatBasisPoints(info.sellLPFee),
    sellBurnTax: formatBasisPoints(info.sellBurnFee),
    sellDividendTax: formatBasisPoints(info.sellDividendFee),
    transferMarketingTax: formatBasisPoints(info.transferFundFee),
    transferReflowTax: formatBasisPoints(info.transferLPFee),
    transferBurnTax: formatBasisPoints(info.transferBurnFee),
    transferDividendTax: formatBasisPoints(info.transferDividendFee),
  }
}

function buildTaxRateArgs(values: Record<string, string>, prefix: 'buy' | 'sell' | 'transfer') {
  return [
    toBasisPoints(values[`${prefix}MarketingTax`]),
    toBasisPoints(values[`${prefix}ReflowTax`]),
    toBasisPoints(values[`${prefix}BurnTax`]),
    toBasisPoints(values[`${prefix}DividendTax`]),
  ]
}

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}
