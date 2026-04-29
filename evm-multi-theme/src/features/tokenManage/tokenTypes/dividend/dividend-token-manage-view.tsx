import type { ReactNode } from 'react'
import {
  DeploymentUnitOutlined,
  FireOutlined,
  FundOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, InputNumber, Segmented, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { parseUnits } from 'viem'
import { useRouteContext } from '@/app/use-route-context'
import { OperationStatus } from '@/components/common/operation-status'
import { CopyButton } from '@/components/common/copy-button'
import { ValueWithTooltip } from '@/components/common/value-with-tooltip'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import { formatCompactNumber, formatText } from '@/utils'
import { getExplorerUrl } from '@/config/chains'
import {
  calcDividendTaxCategoryTotal,
  calcDividendTaxGrandTotal,
  DIVIDEND_TAX_PREFIXES,
  DIVIDEND_TAX_SUFFIXES,
  MAX_DIVIDEND_TAX_PER_GROUP,
  MAX_DIVIDEND_TAX_TOTAL,
  MEDIUM_DIVIDEND_TAX_HINT,
  normalizeTaxInput,
  toBasisPoints,
} from '@/features/tokenDividendCreation/business/tax'
import { queryWithdrawableDividend } from '../../business/tokenManageService'
import { useTokenManageActionRunner } from '../../business/useTokenManageActionRunner'
import {
  formatAddressText,
  formatBasisPoints,
  normalizeTokenAddress,
  resolveTokenManageRole,
  type DividendTokenManageInfo,
} from '../../business/model'

type AddressListMode = 'whitelist' | 'blacklist'
type AddressListAction = 'add' | 'remove'
type ActionSectionKey = 'supply' | 'dividend' | 'listsPermissions' | 'tradingFees' | 'danger'
type ManageStatCard = {
  key: string
  label: string
  value: string
  fullValue?: string
}

export type DividendTokenManageViewProps = {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: DividendTokenManageInfo
  role: ReturnType<typeof resolveTokenManageRole>
  isConnected: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  runner: ReturnType<typeof useTokenManageActionRunner>
}

export function DividendTokenManageInfoSection({
  chainDefinition,
  info,
  role,
  t,
}: DividendTokenManageViewProps) {
  const canViewFundBadge = role === 'fund'
  const supplyCards = useMemo(() => buildSupplyCards(info, t), [info, t])
  const dividendCards = useMemo(() => buildDividendCards(info, t), [info, t])
  const taxInfoGroups = useMemo(() => buildTaxInfoGroups(info, t), [info, t])
  const listSummaryCards = useMemo(() => buildListSummaryCards(info, t), [info, t])

  return (
    <section className="surface-card token-manage-header-card manage-info-unified-card">
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
                  <div className="manage-token-identity">
                    <h2>{info.name}</h2>
                    <span className="manage-token-symbol">{info.symbol}</span>
                  </div>
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
          <AddressStatCard
            chainDefinition={chainDefinition}
            label={t('tokenManage.header.contractAddress')}
            value={info.address}
          />
          <StatCard label={t('tokenManage.header.decimals')} value={String(info.decimals)} />
          <StatCard
            label={t('tokenManage.header.totalSupply')}
            value={formatCompactTokenAmount(info.totalSupply, info.decimals)}
            fullValue={formatFullTokenAmount(info.totalSupply, info.decimals)}
          />
        </div>

        <InfoCluster title="地址摘要">
          <div className="summary-detail-list manage-header-addresses">
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.ownerAddress')} value={info.owner} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.receiveAddress')} value={info.receiveAddress} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.fundAddress')} value={info.fundAddress} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.routerAddress')} value={info.swapRouter} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.mainPair')} value={info.mainPair} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.dividendTracker')} value={info.dividendTracker} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.rewardTokenAddress')} value={info.dividendToken} />
            <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.poolTokenAddress')} value={info.basePoolToken} />
          </div>
        </InfoCluster>

      <div className="manage-info-compact-card">
        <InfoCluster title={t('tokenManage.infoSections.supply.title')}>
          <div className="manage-info-dense-grid">
            {supplyCards.map((card) => (
              <StatCard key={card.key} label={card.label} value={card.value} fullValue={card.fullValue} />
            ))}
          </div>
        </InfoCluster>

        <InfoCluster title={t('tokenManage.infoSections.dividend.title')}>
          <div className="manage-info-dense-grid">
            {dividendCards.map((card) => (
              <StatCard key={card.key} label={card.label} value={card.value} fullValue={card.fullValue} />
            ))}
          </div>
        </InfoCluster>

        <InfoCluster title={t('tokenManage.infoSections.lists.title')}>
          <div className="manage-info-dense-grid">
            {listSummaryCards.map((card) => (
              <StatCard key={card.key} label={card.label} value={card.value} fullValue={card.fullValue} />
            ))}
          </div>
        </InfoCluster>

        <div className="manage-info-tax-block">
          <div className="manage-info-block-head">
            <h4>{t('tokenManage.infoSections.taxes.title')}</h4>
          </div>
          <div className="manage-info-tax-grid">
            {taxInfoGroups.map((group) => (
              <article className="manage-info-tax-card" key={group.key}>
                <div className="manage-info-tax-head">
                  <div className="manage-info-tax-copy">
                    <strong>{group.title}</strong>
                    <p>{t(`tokenManage.taxGroupDescriptions.${group.key}`)}</p>
                  </div>
                  <span className="tax-total-pill">{group.total}</span>
                </div>
                <div className="manage-info-tax-list">
                  {group.items.map((item) => (
                    <div className="manage-info-tax-item" key={item.key}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function DividendTokenManageActionsSection({
  chainDefinition,
  info,
  role,
  isConnected,
  t,
  runner,
}: DividendTokenManageViewProps) {
  const canManage = role === 'owner'
  const [activeSection, setActiveSection] = useState<ActionSectionKey>('supply')
  const sectionNavItems = buildSectionNavItems(t)

  let activeSectionContent: ReactNode = null

  if (activeSection === 'supply') {
    activeSectionContent = (
      <SectionBlock
        sectionId="supply"
        icon={<WalletOutlined />}
        title={t('tokenManage.sections.supply.title')}
        showHeader={false}
      >
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
      </SectionBlock>
    )
  } else if (activeSection === 'dividend') {
    activeSectionContent = (
      <SectionBlock
        sectionId="dividend"
        icon={<WalletOutlined />}
        title={t('tokenManage.sections.dividend.title')}
        showHeader={false}
      >
        <div className="manage-supply-layout">
          <ThresholdsCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction(config)}
          />
          <div className="manage-supply-stack">
            <DividendQueryCard
              chainDefinition={chainDefinition}
              info={info}
              t={t}
            />
          </div>
        </div>
      </SectionBlock>
    )
  } else if (activeSection === 'listsPermissions') {
    activeSectionContent = (
      <SectionBlock
        sectionId="listsPermissions"
        icon={<SafetyCertificateOutlined />}
        title={t('tokenManage.sections.listsPermissions.title')}
        showHeader={false}
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
    )
  } else if (activeSection === 'tradingFees') {
    activeSectionContent = (
      <SectionBlock
        sectionId="tradingFees"
        icon={<FundOutlined />}
        title={t('tokenManage.sections.tradingFees.title')}
        showHeader={false}
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
    )
  } else if (activeSection === 'danger') {
    activeSectionContent = (
      <SectionBlock
        sectionId="danger"
        icon={<FireOutlined />}
        title={t('tokenManage.sections.danger.title')}
        tone="danger"
        showHeader={false}
      >
        <DangerZoneCard
          info={info}
          t={t}
          disabled={!canManage}
          loadingKey={runner.currentActionKey}
          onRunAction={(config) => runner.runAction(config)}
        />
      </SectionBlock>
    )
  }

  return (
    <>
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
        <Segmented
          className="manage-section-segmented"
          value={activeSection}
          options={sectionNavItems}
          onChange={(value) => setActiveSection(value as ActionSectionKey)}
        />
      </section>

      {activeSectionContent}

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

function buildSectionNavItems(t: (key: string, vars?: Record<string, string | number>) => string) {
  return [
    { label: t('tokenManage.actionTabs.supply'), value: 'supply' },
    { label: t('tokenManage.actionTabs.dividend'), value: 'dividend' },
    { label: t('tokenManage.actionTabs.listsPermissions'), value: 'listsPermissions' },
    { label: t('tokenManage.actionTabs.tradingFees'), value: 'tradingFees' },
    { label: t('tokenManage.actionTabs.danger'), value: 'danger' },
  ]
}

function InfoCluster({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="manage-info-cluster">
      <div className="manage-info-block-head">
        <h4>{title}</h4>
      </div>
      {children}
    </section>
  )
}

function SectionBlock({
  sectionId,
  icon,
  title,
  description,
  children,
  tone = 'default',
  showHeader = true,
}: {
  sectionId: string
  icon: ReactNode
  title: string
  description?: string
  children: ReactNode
  tone?: 'default' | 'danger'
  showHeader?: boolean
}) {
  return (
    <section id={`manage-section-${sectionId}`} className={`surface-card manage-section-card ${tone}`}>
      {showHeader ? (
        <div className="manage-section-head">
          <div className="manage-section-icon">{icon}</div>
          <div className="token-section-copy">
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  )
}

function StatCard({ label, value, fullValue }: { label: string; value: string; fullValue?: string }) {
  return (
    <article className="summary-stat-card">
      <span>{label}</span>
      <ValueWithTooltip value={value} fullValue={fullValue} />
    </article>
  )
}

function AddressStatCard({
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
    <article className="summary-detail-card manage-address-card manage-address-stat-card">
      <span>{label}</span>
      <div className="result-inline-value manage-address-value">
        <a className="value-link" href={explorerUrl} target="_blank" rel="noreferrer">
          {formatText(value)}
        </a>
        <CopyButton ariaLabel={label} value={value} />
      </div>
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
    <div className="summary-detail-card manage-address-card">
      <span>{label}</span>
      <div className="result-inline-value manage-address-value">
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
  const amountError = useMemo(
    () => validateMintAmountInput(amount, info.decimals, info.remainingMintable, t),
    [amount, info.decimals, info.remainingMintable, t],
  )

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

    if (amountError) {
      message.warning(amountError)
      return
    }

    const amountWei = parseUnits(amount, info.decimals)
    onSubmit(recipient, amountWei)
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.mint.title')}</h4>
        <p>{t('tokenManage.actions.mint.description')}</p>
      </div>
      <div className="manage-inline-summary manage-mint-summary">
        <div className="manage-summary-metric">
          <span>{t('tokenManage.actions.mint.cap')}</span>
          <ValueWithTooltip
            value={formatCompactTokenAmount(info.initialSupply, info.decimals)}
            fullValue={formatFullTokenAmount(info.initialSupply, info.decimals)}
          />
        </div>
        <div className="manage-summary-metric">
          <span>{t('tokenManage.actions.mint.minted')}</span>
          <ValueWithTooltip
            value={formatCompactTokenAmount(info.totalMinted, info.decimals)}
            fullValue={formatFullTokenAmount(info.totalMinted, info.decimals)}
          />
        </div>
        <div className="manage-summary-metric">
          <span>{t('tokenManage.actions.mint.remaining')}</span>
          <ValueWithTooltip
            value={formatCompactTokenAmount(info.remainingMintable, info.decimals)}
            fullValue={formatFullTokenAmount(info.remainingMintable, info.decimals)}
          />
        </div>
      </div>
      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenManage.actions.mint.recipient')} tooltip={t('tokenManage.actions.mint.recipientTip')} />
          <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={recipient} onChange={(event) => setRecipient(event.target.value)} />
          <small className="manage-field-hint">{t('tokenManage.actions.mint.receiveAddressDividendNotice')}</small>
        </label>
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenManage.actions.mint.amount')} tooltip={t('tokenManage.actions.mint.amountTip')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenManage.placeholder')}
            status={amountError ? 'error' : undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            suffix={info.symbol}
          />
          {amountError ? <small className="field-error">{amountError}</small> : null}
        </label>
      </div>
      <Button type="primary" disabled={disabled || !info.mintEnabled} onClick={handleSubmit}>
        {t('tokenManage.actionButtons.mint')}
      </Button>
      {!info.mintEnabled ? <small className="field-error manage-disabled-note">{t('tokenManage.errors.mintDisabled')}</small> : null}
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
          currentValue={(
            <ValueWithTooltip
              value={formatCompactTokenAmount(info.minHoldingForDividend, info.decimals)}
              fullValue={formatFullTokenAmount(info.minHoldingForDividend, info.decimals)}
              placement="left"
            />
          )}
          control={
            <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={minHolding} onChange={(event) => setMinHolding(event.target.value)} />
          }
          buttonText={t('tokenManage.actionButtons.edit')}
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
          currentValue={(
            <ValueWithTooltip
              value={formatCompactTokenAmount(info.dividendTriggerThreshold, info.decimals)}
              fullValue={formatFullTokenAmount(info.dividendTriggerThreshold, info.decimals)}
              placement="left"
            />
          )}
          control={
            <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          }
          buttonText={t('tokenManage.actionButtons.edit')}
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
          currentValue={(
            <ValueWithTooltip
              value={formatCompactNumber({ value: info.autoProcessGasLimit })}
              fullValue={String(info.autoProcessGasLimit)}
              placement="left"
            />
          )}
          control={
            <InputNumber
              className="token-form-number"
              controls={false}
              stringMode
              min="1"
              placeholder={t('tokenManage.placeholder')}
              precision={0}
              style={{ width: '100%' }}
              value={gasLimit}
              onChange={(value) => setGasLimit(String(value ?? ''))}
            />
          }
          buttonText={t('tokenManage.actionButtons.edit')}
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
          className="manage-inline-action-row-manual-process"
          label={t('tokenManage.actions.thresholds.manualProcess')}
          currentValue={(
            <>
              {t('tokenManage.actions.thresholds.pendingDividends')}: {' '}
              <ValueWithTooltip
                value={formatCompactTokenAmount(info.pendingDividends, info.dividendTokenInfo?.decimals ?? info.decimals)}
                fullValue={formatFullTokenAmount(info.pendingDividends, info.dividendTokenInfo?.decimals ?? info.decimals)}
                placement="left"
              />
            </>
          )}
          controlLabel={t('tokenManage.actions.thresholds.manualProcessGas')}
          control={
            <InputNumber
              className="token-form-number"
              controls={false}
              stringMode
              min="1"
              placeholder={t('tokenManage.placeholder')}
              precision={0}
              style={{ width: '100%' }}
              value={processGasLimit}
              onChange={(value) => setProcessGasLimit(String(value ?? ''))}
            />
          }
          buttonText={t('tokenManage.actionButtons.execute')}
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
  const [result, setResult] = useState<{ value: string; fullValue: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleQuery() {
    if (!queryAddress || !isValidAddress(queryAddress)) {
      message.warning(t('tokenManage.errors.invalidAddress'))
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const rewardDecimals = info.dividendTokenInfo?.decimals ?? info.decimals
      const queried = await queryWithdrawableDividend({
        chainDefinition,
        tokenAddress: info.address,
        account: queryAddress,
        rewardDecimals,
      })
      const suffix = info.dividendTokenInfo?.symbol ? ` ${info.dividendTokenInfo.symbol}` : ''
      const fullAmount = formatFullTokenAmount(queried.rawAmount, rewardDecimals)
      setResult({
        value: `${formatCompactTokenAmount(queried.rawAmount, rewardDecimals)}${suffix}`,
        fullValue: `${fullAmount}${suffix}`,
      })
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
        <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={queryAddress} onChange={(event) => setQueryAddress(event.target.value)} />
      </label>
      {result ? (
        <div className="manage-query-result">
          <span>{t('tokenManage.actions.query.result')}</span>
          <ValueWithTooltip value={result.value} fullValue={result.fullValue} />
        </div>
      ) : null}
      <Button type="default" onClick={handleQuery} disabled={loading}>
        {loading ? t('tokenManage.actions.query.loading') : t('tokenManage.actionButtons.query')}
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
  const [addressInput, setAddressInput] = useState('')
  const list = mode === 'whitelist' ? info.whitelistAddresses : info.blacklistAddresses
  const enabled = mode === 'whitelist' ? info.whitelistEnabled : info.blacklistEnabled
  const permissionClosed = !enabled
  const addDisabled = permissionClosed && operation === 'add'
  const protectedSet = new Set(info.protectedAddresses.map((item) => normalizeTokenAddress(item)))
  const protectedItems = mode === 'whitelist' ? list.filter((item) => protectedSet.has(normalizeTokenAddress(item))) : []
  const editableItems = mode === 'whitelist' ? list.filter((item) => !protectedSet.has(normalizeTokenAddress(item))) : list
  const clearableCount = editableItems.length
  const listActionsUnavailable = permissionClosed && clearableCount === 0

  function handleSubmit() {
    const parsedAddresses = parseAddressTextArea(addressInput)
    if (parsedAddresses.length === 0) {
      message.warning(t('tokenManage.errors.invalidAddressList'))
      return
    }

    const invalidAddresses = parsedAddresses.filter((item) => !isValidAddress(item))
    if (invalidAddresses.length > 0) {
      message.warning(t('tokenManage.errors.invalidAddressList'))
      return
    }

    const duplicateAddresses = findDuplicateAddresses(parsedAddresses)
    if (duplicateAddresses.length > 0) {
      message.warning(t('tokenManage.errors.duplicateAddressList', { count: duplicateAddresses.length }))
      return
    }

    const protectedInputAddresses = parsedAddresses.filter((item) => protectedSet.has(normalizeTokenAddress(item)))
    if (protectedInputAddresses.length > 0) {
      message.warning(t('tokenManage.errors.protectedAddressList', { count: protectedInputAddresses.length }))
      return
    }

    const submitAddresses = uniqueAddresses(parsedAddresses)
    const existingSet = new Set(list.map((item) => normalizeTokenAddress(item)))
    const existingInputAddresses = submitAddresses.filter((item) => existingSet.has(normalizeTokenAddress(item)))
    const missingInputAddresses = submitAddresses.filter((item) => !existingSet.has(normalizeTokenAddress(item)))

    if (operation === 'add') {
      if (!enabled) {
        message.warning(t('tokenManage.errors.listDisabledAdd'))
        return
      }
      if (existingInputAddresses.length > 0) {
        message.warning(t('tokenManage.errors.addressesAlreadyInList', { count: existingInputAddresses.length }))
        return
      }
    } else {
      if (missingInputAddresses.length > 0) {
        message.warning(t('tokenManage.errors.addressesNotInList', { count: missingInputAddresses.length }))
        return
      }
    }

    onRunAction({
      key: `${mode}-${operation}`,
      title: t(`tokenManage.actions.${mode}.title`),
      functionName: 'batchSetList',
      args: [mode === 'whitelist', submitAddresses, operation === 'add'],
      successMessage: t(`tokenManage.actions.${mode}.${operation}Success`),
      failureMessage: t(`tokenManage.actions.${mode}.${operation}Failed`),
    })
  }

  function handleClearList() {
    if (clearableCount === 0) {
      message.warning(t(`tokenManage.actions.${mode}.clearEmpty`))
      return
    }

    onRunAction({
      key: `${mode}-clear`,
      title: t(`tokenManage.actions.${mode}.clear`),
      functionName: 'clearList',
      args: [mode === 'whitelist'],
      successMessage: t(`tokenManage.actions.${mode}.clearSuccess`),
      failureMessage: t(`tokenManage.actions.${mode}.clearFailed`),
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
      <div className="manage-inline-form">
        <Segmented
          className="manage-list-operation-switch"
          disabled={disabled || listActionsUnavailable}
          value={operation}
          options={[
            { label: t('tokenManage.list.add'), value: 'add' },
            { label: t('tokenManage.list.remove'), value: 'remove' },
          ]}
          onChange={(value) => setOperation(value as AddressListAction)}
        />
        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 8 }}
          className="manage-address-textarea"
          disabled={disabled || addDisabled || listActionsUnavailable}
          placeholder={t('tokenManage.list.addressInputPlaceholder')}
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
        />
        <Button type="primary" disabled={disabled || addDisabled || listActionsUnavailable || loadingKey === `${mode}-${operation}`} onClick={handleSubmit}>
          {t(`tokenManage.actions.${mode}.${operation}`)}
        </Button>
        <Button danger disabled={disabled || clearableCount === 0 || listActionsUnavailable || loadingKey === `${mode}-clear`} onClick={handleClearList}>
          {t(`tokenManage.actions.${mode}.clear`)}
        </Button>
      </div>
      {permissionClosed ? (
        <small className="field-error manage-disabled-note">
          {t(`tokenManage.actions.${mode}.${clearableCount > 0 ? 'disabledNote' : 'disabledEmptyNote'}`)}
        </small>
      ) : null}
      <ul className="manage-address-list">
        {(mode === 'whitelist' ? [...protectedItems, ...editableItems] : editableItems).map((item) => (
          <li className="manage-address-list-item" key={item}>
            <AddressTag
              chainDefinition={chainDefinition}
              address={item}
              protectedTag={protectedSet.has(normalizeTokenAddress(item))}
              protectedLabel={t('tokenManage.list.protected')}
            />
          </li>
        ))}
        {!list.length ? <li className="manage-address-empty">{t('tokenManage.list.empty')}</li> : null}
      </ul>
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
        <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={nextOwner} onChange={(event) => setNextOwner(event.target.value)} />
      </label>
      <Button
        type="primary"
        disabled={disabled || loadingKey === 'transferOwnership'}
        onClick={() => {
          if (!nextOwner || !isValidAddress(nextOwner)) {
            message.warning(t('tokenManage.errors.invalidAddress'))
            return
          }
          if (normalizeTokenAddress(nextOwner) === normalizeTokenAddress(info.owner)) {
            message.warning(t('tokenManage.errors.sameAddressUnchanged'))
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
        {t('tokenManage.actionButtons.transfer')}
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
  const grandTotal = calcDividendTaxGrandTotal(formValues as never)
  const isGrandTotalExceeded = grandTotal > MAX_DIVIDEND_TAX_TOTAL

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
    const exceededCategory = DIVIDEND_TAX_PREFIXES.find(
      (prefix) => calcDividendTaxCategoryTotal(formValues as never, prefix) > MAX_DIVIDEND_TAX_PER_GROUP,
    )
    if (exceededCategory) {
      message.warning(
        t('tokenManage.errors.taxCategoryExceeded', {
          type: t(`tokenManage.taxGroups.${exceededCategory}`),
          max: MAX_DIVIDEND_TAX_PER_GROUP,
        }),
      )
      return
    }
    if (isGrandTotalExceeded) {
      message.warning(t('tokenManage.errors.taxGrandTotalExceeded', { max: MAX_DIVIDEND_TAX_TOTAL }))
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
    <article className="manage-operation-card manage-operation-card-wide manage-tax-settings-card">
      <div className="tax-section-copy">
        <h4>{t('tokenManage.actions.taxRates.title')}</h4>
      </div>
      <div className="tax-group-grid manage-tax-group-grid">
        {DIVIDEND_TAX_PREFIXES.map((prefix) => {
          const categoryTotal = calcDividendTaxCategoryTotal(formValues as never, prefix)
          const isGroupWarning = categoryTotal >= MEDIUM_DIVIDEND_TAX_HINT && categoryTotal < MAX_DIVIDEND_TAX_PER_GROUP
          const isGroupExceeded = categoryTotal > MAX_DIVIDEND_TAX_PER_GROUP

          return (
            <section className={`dividend-tax-card ${isGroupExceeded ? 'is-error' : ''}`} key={prefix}>
              <div className="dividend-tax-card-head">
                <div>
                  <strong>{t(`tokenManage.taxGroups.${prefix}`)}</strong>
                </div>
                <span className={`tax-total-pill ${isGroupWarning ? 'is-warning' : ''} ${isGroupExceeded ? 'is-error' : ''}`}>
                  {categoryTotal}%
                </span>
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
                        placeholder="0"
                        suffix={<span className="tax-percent-suffix">%</span>}
                        value={formValues[key]}
                        onBlur={() => updateField(key, normalizeTaxBlurValue(formValues[key]))}
                        onChange={(event) => updateField(key, normalizeTaxInput(event.target.value))}
                      />
                    </label>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <div className="tax-total-bar">
        <span>{t('tokenManage.actions.taxRates.total')}</span>
        <strong className={isGrandTotalExceeded ? 'is-error' : ''}>{grandTotal}%</strong>
      </div>
      <div className="manage-tax-submit-row">
        <Button type="primary" disabled={disabled || loadingKey === 'taxRates'} onClick={handleSubmit}>
          {t('tokenManage.actionButtons.edit')}
        </Button>
      </div>
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
        <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={fundAddress} onChange={(event) => setFundAddress(event.target.value)} />
      </label>
      <Button
        type="primary"
        disabled={disabled || loadingKey === 'fundAddress'}
        onClick={() => {
          if (!fundAddress || !isValidAddress(fundAddress)) {
            message.warning(t('tokenManage.errors.invalidAddress'))
            return
          }
          if (normalizeTokenAddress(fundAddress) === normalizeTokenAddress(info.fundAddress)) {
            message.warning(t('tokenManage.errors.sameAddressUnchanged'))
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
        {t('tokenManage.actionButtons.edit')}
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
  const [killBlockDraft, setKillBlockDraft] = useState<{ address: string; value: string } | null>(null)
  const killBlockCount = killBlockDraft?.address === info.address ? killBlockDraft.value : String(info.killBlockCount)
  const killBlockLocked = info.tradingEnabled

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
        currentValue={(
          <ValueWithTooltip
            value={formatCompactNumber({ value: info.killBlockCount })}
            fullValue={String(info.killBlockCount)}
          />
        )}
        variant="plain"
        control={
          <InputNumber
            className="token-form-number"
            controls={false}
            disabled={killBlockLocked}
            stringMode
            min="0"
            placeholder={t('tokenManage.placeholder')}
            precision={0}
            style={{ width: '100%' }}
            value={killBlockCount}
            onChange={(value) => setKillBlockDraft({ address: info.address, value: String(value ?? '') })}
          />
        }
        buttonText={t('tokenManage.actionButtons.edit')}
        disabled={disabled || loadingKey === 'killBlock' || killBlockLocked}
        onSubmit={() => {
          if (!/^\d+$/.test(killBlockCount)) {
            message.warning(t('tokenManage.errors.invalidKillBlock'))
            return
          }
          setKillBlockDraft(null)
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
      {!info.manualTradingEnable ? (
        <small className="field-error manage-disabled-note">{t('tokenManage.actions.trading.manualTradingDisabled')}</small>
      ) : null}
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
      label: t('tokenManage.danger.mintFeature'),
      description: t('tokenDividendCreation.tooltips.mintEnabled'),
      enabled: info.mintEnabled,
      functionName: 'disableMintForever',
      buttonText: info.mintEnabled ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.danger.disableMintSuccess'),
      failureMessage: t('tokenManage.danger.disableMintFailed'),
    },
    {
      key: 'disableWhitelist',
      label: t('tokenManage.danger.whitelistFeature'),
      description: t('tokenDividendCreation.tooltips.whitelistEnabled'),
      enabled: info.whitelistEnabled,
      functionName: 'setWhitelistEnabled',
      args: [false],
      buttonText: info.whitelistEnabled ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.danger.disableWhitelistSuccess'),
      failureMessage: t('tokenManage.danger.disableWhitelistFailed'),
    },
    {
      key: 'disableBlacklist',
      label: t('tokenManage.danger.blacklistFeature'),
      description: t('tokenDividendCreation.tooltips.blacklistEnabled'),
      enabled: info.blacklistEnabled,
      functionName: 'setBlacklistEnabled',
      args: [false],
      buttonText: info.blacklistEnabled ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.danger.disableBlacklistSuccess'),
      failureMessage: t('tokenManage.danger.disableBlacklistFailed'),
    },
    {
      key: 'renounceOwnership',
      label: t('tokenManage.danger.ownershipFeature'),
      description: t('tokenManage.danger.ownershipDescription'),
      enabled: normalizeTokenAddress(info.owner) !== normalizeTokenAddress('0x0000000000000000000000000000000000000000'),
      functionName: 'renounceOwnership',
      buttonText: normalizeTokenAddress(info.owner) !== normalizeTokenAddress('0x0000000000000000000000000000000000000000')
        ? t('tokenManage.danger.renounceAction')
        : t('tokenManage.danger.renouncedAction'),
      successMessage: t('tokenManage.danger.renounceOwnershipSuccess'),
      failureMessage: t('tokenManage.danger.renounceOwnershipFailed'),
    },
  ]

  return (
    <article className="manage-danger-grid">
      <Alert
        className="manage-danger-alert"
        type="warning"
        showIcon
        message={t('tokenManage.danger.warning')}
        description={t('tokenManage.danger.description')}
      />
      {actions.map((action) => (
        <div className="manage-danger-item" key={action.key}>
          <div className="manage-danger-copy">
            <strong>{action.label}</strong>
            <p>{action.description}</p>
          </div>
          <Button
            className="manage-danger-button"
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
            {action.buttonText}
          </Button>
        </div>
      ))}
    </article>
  )
}

function InlineActionRow({
  className,
  label,
  currentValue,
  controlLabel,
  control,
  buttonText,
  disabled,
  onSubmit,
  variant = 'card',
}: {
  className?: string
  label: string
  currentValue: ReactNode
  controlLabel?: string
  control: ReactNode
  buttonText: string
  disabled: boolean
  onSubmit: () => void
  variant?: 'card' | 'plain'
}) {
  const rowClassName = [
    'manage-inline-action-row',
    variant === 'plain' ? 'plain' : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div className={rowClassName}>
      <div className="manage-inline-action-head">
        <strong>{label}</strong>
        <span>{currentValue}</span>
      </div>
      <div className="manage-inline-action-controls">
        <div className="manage-inline-action-input">
          {controlLabel ? <span className="manage-inline-control-label">{controlLabel}</span> : null}
          {control}
        </div>
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
    <div className={`manage-address-tag ${protectedTag ? 'protected' : ''}`}>
      <a href={getExplorerUrl(chainDefinition, 'address', address)} target="_blank" rel="noreferrer">
        {formatAddressText(address)}
      </a>
      <div className="manage-address-tag-actions">
        {protectedTag ? <span className="manage-address-badge">{protectedLabel}</span> : null}
        <CopyButton ariaLabel={address} value={address} />
      </div>
    </div>
  )
}

function buildSupplyCards(info: DividendTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
  return [
    {
      key: 'initialSupply',
      label: t('tokenManage.infoFields.initialSupply'),
      value: formatCompactTokenAmount(info.initialSupply, info.decimals),
      fullValue: formatFullTokenAmount(info.initialSupply, info.decimals),
    },
    {
      key: 'totalMinted',
      label: t('tokenManage.infoFields.totalMinted'),
      value: formatCompactTokenAmount(info.totalMinted, info.decimals),
      fullValue: formatFullTokenAmount(info.totalMinted, info.decimals),
    },
    {
      key: 'remainingMintable',
      label: t('tokenManage.infoFields.remainingMintable'),
      value: formatCompactTokenAmount(info.remainingMintable, info.decimals),
      fullValue: formatFullTokenAmount(info.remainingMintable, info.decimals),
    },
    { key: 'mintEnabled', label: t('tokenManage.infoFields.mintEnabled'), value: formatEnabledLabel(info.mintEnabled, t) },
  ]
}

function buildDividendCards(info: DividendTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
  const rewardTokenDecimals = info.dividendTokenInfo?.decimals ?? info.decimals

  return [
    { key: 'dividendMode', label: t('tokenManage.infoFields.dividendMode'), value: info.isSameTokenDividend ? t('tokenManage.infoFields.sameTokenDividend') : t('tokenManage.infoFields.externalTokenDividend') },
    { key: 'poolToken', label: t('tokenManage.infoFields.poolToken'), value: info.basePoolTokenInfo?.symbol ?? formatAddressText(info.basePoolToken) },
    {
      key: 'minHolding',
      label: t('tokenManage.infoFields.minHolding'),
      value: formatCompactTokenAmount(info.minHoldingForDividend, info.decimals),
      fullValue: formatFullTokenAmount(info.minHoldingForDividend, info.decimals),
    },
    {
      key: 'triggerThreshold',
      label: t('tokenManage.infoFields.triggerThreshold'),
      value: formatCompactTokenAmount(info.dividendTriggerThreshold, info.decimals),
      fullValue: formatFullTokenAmount(info.dividendTriggerThreshold, info.decimals),
    },
    {
      key: 'autoGas',
      label: t('tokenManage.infoFields.autoGas'),
      value: formatCompactNumber({ value: info.autoProcessGasLimit }),
      fullValue: String(info.autoProcessGasLimit),
    },
    {
      key: 'pendingDividends',
      label: t('tokenManage.infoFields.pendingDividends'),
      value: formatCompactTokenAmount(info.pendingDividends, rewardTokenDecimals),
      fullValue: formatFullTokenAmount(info.pendingDividends, rewardTokenDecimals),
    },
    {
      key: 'totalDistributed',
      label: t('tokenManage.infoFields.totalDistributed'),
      value: formatCompactTokenAmount(info.totalDividendsDistributed, rewardTokenDecimals),
      fullValue: formatFullTokenAmount(info.totalDividendsDistributed, rewardTokenDecimals),
    },
    { key: 'tradingEnabled', label: t('tokenManage.infoFields.tradingEnabled'), value: formatTradingStatusLabel(info.tradingEnabled, t) },
    { key: 'manualTrading', label: t('tokenManage.infoFields.manualTrading'), value: formatEnabledLabel(info.manualTradingEnable, t) },
    {
      key: 'killBlock',
      label: t('tokenManage.infoFields.killBlock'),
      value: formatCompactNumber({ value: info.killBlockCount }),
      fullValue: String(info.killBlockCount),
    },
  ]
}

function buildTaxInfoGroups(info: DividendTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string) {
  return [
    {
      key: 'buy',
      title: t('tokenManage.taxGroups.buy'),
      total: formatPercent(info.buyFundFee + info.buyLPFee + info.buyBurnFee + info.buyDividendFee),
      items: [
        { key: 'marketing', label: t('tokenManage.taxFields.MarketingTax'), value: formatPercent(info.buyFundFee) },
        { key: 'reflow', label: t('tokenManage.taxFields.ReflowTax'), value: formatPercent(info.buyLPFee) },
        { key: 'burn', label: t('tokenManage.taxFields.BurnTax'), value: formatPercent(info.buyBurnFee) },
        { key: 'dividend', label: t('tokenManage.taxFields.DividendTax'), value: formatPercent(info.buyDividendFee) },
      ],
    },
    {
      key: 'sell',
      title: t('tokenManage.taxGroups.sell'),
      total: formatPercent(info.sellFundFee + info.sellLPFee + info.sellBurnFee + info.sellDividendFee),
      items: [
        { key: 'marketing', label: t('tokenManage.taxFields.MarketingTax'), value: formatPercent(info.sellFundFee) },
        { key: 'reflow', label: t('tokenManage.taxFields.ReflowTax'), value: formatPercent(info.sellLPFee) },
        { key: 'burn', label: t('tokenManage.taxFields.BurnTax'), value: formatPercent(info.sellBurnFee) },
        { key: 'dividend', label: t('tokenManage.taxFields.DividendTax'), value: formatPercent(info.sellDividendFee) },
      ],
    },
    {
      key: 'transfer',
      title: t('tokenManage.taxGroups.transfer'),
      total: formatPercent(info.transferFundFee + info.transferLPFee + info.transferBurnFee + info.transferDividendFee),
      items: [
        { key: 'marketing', label: t('tokenManage.taxFields.MarketingTax'), value: formatPercent(info.transferFundFee) },
        { key: 'reflow', label: t('tokenManage.taxFields.ReflowTax'), value: formatPercent(info.transferLPFee) },
        { key: 'burn', label: t('tokenManage.taxFields.BurnTax'), value: formatPercent(info.transferBurnFee) },
        { key: 'dividend', label: t('tokenManage.taxFields.DividendTax'), value: formatPercent(info.transferDividendFee) },
      ],
    },
  ] as const
}

function buildListSummaryCards(info: DividendTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
  return [
    { key: 'whitelistEnabled', label: t('tokenManage.infoFields.whitelistEnabled'), value: formatEnabledLabel(info.whitelistEnabled, t) },
    {
      key: 'whitelistCount',
      label: t('tokenManage.infoFields.whitelistCount'),
      value: formatCompactNumber({ value: info.whitelistAddresses.length }),
      fullValue: String(info.whitelistAddresses.length),
    },
    { key: 'blacklistEnabled', label: t('tokenManage.infoFields.blacklistEnabled'), value: formatEnabledLabel(info.blacklistEnabled, t) },
    {
      key: 'blacklistCount',
      label: t('tokenManage.infoFields.blacklistCount'),
      value: formatCompactNumber({ value: info.blacklistAddresses.length }),
      fullValue: String(info.blacklistAddresses.length),
    },
    {
      key: 'protectedCount',
      label: t('tokenManage.infoFields.protectedCount'),
      value: formatCompactNumber({ value: info.protectedAddresses.length }),
      fullValue: String(info.protectedAddresses.length),
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

function parseAddressTextArea(value: string) {
  return value
    .split(/\r?\n/)
    .map((rawLine) => rawLine.trim())
    .filter(Boolean)
}

function uniqueAddresses(addresses: string[]) {
  const addressMap = new Map<string, string>()

  for (const address of addresses) {
    addressMap.set(normalizeTokenAddress(address), address)
  }

  return Array.from(addressMap.values())
}

function findDuplicateAddresses(addresses: string[]) {
  const seen = new Set<string>()
  const duplicated = new Set<string>()

  for (const address of addresses) {
    const normalized = normalizeTokenAddress(address)
    if (seen.has(normalized)) {
      duplicated.add(normalized)
      continue
    }
    seen.add(normalized)
  }

  return Array.from(duplicated)
}

function formatCompactTokenAmount(value: bigint, decimals: number) {
  return formatCompactNumber({ value: formatFullTokenAmount(value, decimals) })
}

function formatFullTokenAmount(value: bigint, decimals: number) {
  const safeDecimals = Math.max(0, Math.trunc(decimals))
  const sign = value < 0n ? '-' : ''
  const absValue = value < 0n ? -value : value

  if (safeDecimals === 0) {
    return `${sign}${absValue.toString()}`
  }

  const base = 10n ** BigInt(safeDecimals)
  const integerPart = absValue / base
  const fractionPart = absValue % base
  const fractionText = fractionPart.toString().padStart(safeDecimals, '0').replace(/0+$/, '')

  return fractionText ? `${sign}${integerPart.toString()}.${fractionText}` : `${sign}${integerPart.toString()}`
}

function formatPercent(value: bigint) {
  return `${formatBasisPoints(value)}%`
}

function formatEnabledLabel(value: boolean, t: (key: string, vars?: Record<string, string | number>) => string) {
  return value ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled')
}

function formatTradingStatusLabel(value: boolean, t: (key: string, vars?: Record<string, string | number>) => string) {
  return value ? t('tokenManage.header.tradingEnabled') : t('tokenManage.header.tradingClosed')
}

function normalizeTaxBlurValue(value: string) {
  const normalized = normalizeTaxInput(value)
  if (!normalized) {
    return ''
  }

  const [integerPart, decimalPart = ''] = normalized.split('.')
  if (!decimalPart) {
    return integerPart
  }

  const trimmedDecimalPart = decimalPart.replace(/0+$/, '')
  return trimmedDecimalPart ? `${integerPart}.${trimmedDecimalPart}` : integerPart
}

function validateMintAmountInput(
  value: string,
  decimals: number,
  remainingMintable: bigint,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return t('tokenManage.errors.invalidAmount')
  }

  const [, fractionPart = ''] = normalized.split('.')
  if (fractionPart.length > decimals) {
    return t('tokenManage.errors.mintAmountDecimalsExceeded', { decimals })
  }

  try {
    const amountWei = parseUnits(normalized, decimals)
    if (amountWei <= 0n) {
      return t('tokenManage.errors.invalidAmount')
    }
    if (amountWei > remainingMintable) {
      return t('tokenManage.errors.mintExceedsCap')
    }
  } catch {
    return t('tokenManage.errors.invalidAmount')
  }

  return null
}
