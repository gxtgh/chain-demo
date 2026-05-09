import type { ReactNode } from 'react'
import {
  ControlOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleFilled,
  FireOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, Segmented, message } from 'antd'
import { useState } from 'react'
import { parseUnits } from 'viem'
import { useRouteContext } from '@/app/use-route-context'
import { OperationStatus } from '@/components/common/operation-status'
import { CopyButton } from '@/components/common/copy-button'
import { ValueWithTooltip } from '@/components/common/value-with-tooltip'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import { formatCompactNumber, formatText } from '@/utils'
import { getExplorerUrl } from '@/config/chains'
import { useTokenManageActionRunner } from '../../business/useTokenManageActionRunner'
import {
  formatAddressText,
  normalizeTokenAddress,
  resolveTokenManageRole,
  type SimpleControlTokenManageInfo,
} from '../../business/model'

type AddressListMode = 'whitelist' | 'blacklist'
type AddressListAction = 'add' | 'remove'
type ActionSectionKey = 'supply' | 'controls' | 'listsPermissions' | 'danger'
type ManageStatCard = {
  key: string
  label: string
  value: ReactNode
  fullValue?: ReactNode
}

export type SimpleControlTokenManageViewProps = {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: SimpleControlTokenManageInfo
  role: ReturnType<typeof resolveTokenManageRole>
  isConnected: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  runner: ReturnType<typeof useTokenManageActionRunner>
}

export function SimpleControlTokenManageInfoSection({
  chainDefinition,
  info,
  role,
  t,
}: SimpleControlTokenManageViewProps) {
  const supplyCards = buildSimpleSupplyCards(info, t)
  const controlCards = buildSimpleControlCards(info, t)
  const listCards = buildSimpleListCards(info, t)

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
                <span className="permission-highlight-pill">{t('tokenManage.header.typeSimpleControl')}</span>
                <span className={`status-chip ${info.pause ? 'warning' : 'success'}`}>
                  {info.pause ? t('tokenManage.header.paused') : t('tokenManage.header.notPaused')}
                </span>
                <span className={`status-chip ${role === 'owner' ? 'success' : 'warning'}`}>
                  {role === 'owner' ? t('tokenManage.header.roleOwner') : t('tokenManage.header.roleViewer')}
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

      <InfoCluster title={t('tokenManage.simpleControl.info.addresses')}>
        <div className="summary-detail-list manage-header-addresses">
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.ownerAddress')} value={info.owner} />
          <AddressCard chainDefinition={chainDefinition} label={t('tokenManage.header.receiveAddress')} value={info.receiveAddress} />
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

        <InfoCluster title={t('tokenManage.simpleControl.info.controls')}>
          <div className="manage-info-dense-grid">
            {controlCards.map((card) => (
              <StatCard key={card.key} label={card.label} value={card.value} fullValue={card.fullValue} />
            ))}
          </div>
        </InfoCluster>

        <InfoCluster title={t('tokenManage.infoSections.lists.title')}>
          <div className="manage-info-dense-grid">
            {listCards.map((card) => (
              <StatCard key={card.key} label={card.label} value={card.value} fullValue={card.fullValue} />
            ))}
          </div>
        </InfoCluster>
      </div>
    </section>
  )
}

export function SimpleControlTokenManageActionsSection({
  chainDefinition,
  info,
  role,
  isConnected,
  t,
  runner,
}: SimpleControlTokenManageViewProps) {
  const canManage = role === 'owner'
  const [activeSection, setActiveSection] = useState<ActionSectionKey>('supply')
  const sectionNavItems = [
    { label: t('tokenManage.actionTabs.supply'), value: 'supply' },
    { label: t('tokenManage.simpleControl.tabs.controls'), value: 'controls' },
    { label: t('tokenManage.actionTabs.listsPermissions'), value: 'listsPermissions' },
    { label: t('tokenManage.actionTabs.danger'), value: 'danger' },
  ]

  let activeSectionContent: ReactNode = null

  if (activeSection === 'supply') {
    activeSectionContent = (
      <SectionBlock sectionId="supply" icon={<WalletOutlined />} title={t('tokenManage.sections.supply.title')} showHeader={false}>
        <MintCard
          info={info}
          t={t}
          disabled={!canManage || runner.currentActionKey === 'mint'}
          onSubmit={(recipient, amount) => {
            runner.runAction({
              key: 'mint',
              tokenType: 'simpleControl',
              title: t('tokenManage.actions.mint.title'),
              functionName: 'mintTokens',
              args: [recipient, amount],
              successMessage: t('tokenManage.actions.mint.success'),
              failureMessage: t('tokenManage.actions.mint.failed'),
            })
          }}
        />
      </SectionBlock>
    )
  } else if (activeSection === 'controls') {
    activeSectionContent = (
      <SectionBlock sectionId="controls" icon={<ControlOutlined />} title={t('tokenManage.simpleControl.sections.controls')} showHeader={false}>
        <div className="manage-section-grid">
          <PauseControlCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
          />
          <WalletLimitCard
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
          />
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
            onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
          />
          <AddressListCard
            chainDefinition={chainDefinition}
            info={info}
            mode="blacklist"
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
          />
          <TransferOwnershipCard
            chainDefinition={chainDefinition}
            info={info}
            t={t}
            disabled={!canManage}
            loadingKey={runner.currentActionKey}
            onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
          />
        </div>
      </SectionBlock>
    )
  } else if (activeSection === 'danger') {
    activeSectionContent = (
      <SectionBlock sectionId="danger" icon={<FireOutlined />} title={t('tokenManage.sections.danger.title')} tone="danger" showHeader={false}>
        <DangerZoneCard
          info={info}
          t={t}
          disabled={!canManage}
          loadingKey={runner.currentActionKey}
          onRunAction={(config) => runner.runAction({ ...config, tokenType: 'simpleControl' })}
        />
      </SectionBlock>
    )
  }

  return (
    <>
      {!isConnected || !canManage ? (
        <Alert
          className="manage-permission-alert"
          type="warning"
          showIcon
          icon={<ExclamationCircleFilled />}
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
          { id: 1, text: t('tokenManage.progress.waitingWallet'), errorText: t('tokenManage.progress.waitingWalletFailed') },
          { id: 2, text: t('tokenManage.progress.pending'), errorText: t('tokenManage.progress.pendingFailed') },
          { id: 3, text: t('tokenManage.progress.completed'), errorText: t('tokenManage.progress.failed') },
        ]}
        cancelBtnShow={false}
        onClose={runner.closeStatus}
      />
    </>
  )
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
  children,
  tone = 'default',
  showHeader = true,
}: {
  sectionId: string
  icon: ReactNode
  title: string
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
          </div>
        </div>
      ) : null}
      {children}
    </section>
  )
}

function StatCard({ label, value, fullValue }: { label: string; value: ReactNode; fullValue?: ReactNode }) {
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

function InlineAddressValue({
  chainDefinition,
  address,
  ariaLabel,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  address: string
  ariaLabel: string
}) {
  const explorerUrl = getExplorerUrl(chainDefinition, 'address', address)

  return (
    <div className="manage-current-address-value">
      <a className="value-link" href={explorerUrl} target="_blank" rel="noreferrer">
        {formatAddressText(address)}
      </a>
      <CopyButton ariaLabel={ariaLabel} value={address} />
    </div>
  )
}

function MintCard({
  info,
  t,
  onSubmit,
  disabled,
}: {
  info: SimpleControlTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  onSubmit: (recipient: string, amount: bigint) => void
  disabled: boolean
}) {
  const [recipient, setRecipient] = useState(info.receiveAddress)
  const [amount, setAmount] = useState('')
  const amountError = validateAmountInput(amount, info.decimals, t)

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
    onSubmit(recipient, parseUnits(amount, info.decimals))
  }

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.mint.title')}</h4>
        <p>{t('tokenManage.simpleControl.actions.mint.description')}</p>
      </div>
      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenManage.actions.mint.recipient')} tooltip={t('tokenManage.actions.mint.recipientTip')} />
          <Input className="token-form-input" placeholder={t('tokenManage.placeholder')} value={recipient} onChange={(event) => setRecipient(event.target.value)} />
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
      <Button type="primary" disabled={disabled || !info.enableMint} onClick={handleSubmit}>
        {t('tokenManage.actionButtons.mint')}
      </Button>
      {!info.enableMint ? <small className="field-error manage-disabled-note">{t('tokenManage.errors.mintDisabled')}</small> : null}
    </article>
  )
}

function PauseControlCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: SimpleControlTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: ActionConfig) => void
}) {
  const nextAction = info.pause ? 'resumeTrading' : 'pauseTrading'
  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.simpleControl.actions.pause.title')}</h4>
        <p>{t('tokenManage.simpleControl.actions.pause.description')}</p>
      </div>
      <div className="manage-inline-summary">
        <span>{t('tokenManage.simpleControl.fields.pauseFeature')}</span>
        <strong>{info.enablePause ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled')}</strong>
        <span>{t('tokenManage.simpleControl.fields.pauseStatus')}</span>
        <strong>{info.pause ? t('tokenManage.header.paused') : t('tokenManage.header.notPaused')}</strong>
      </div>
      <Button
        type="primary"
        disabled={disabled || !info.enablePause || loadingKey === nextAction}
        onClick={() =>
          onRunAction({
            key: nextAction,
            title: t(`tokenManage.simpleControl.actions.pause.${info.pause ? 'resume' : 'pause'}`),
            functionName: nextAction,
            args: [],
            successMessage: t(`tokenManage.simpleControl.actions.pause.${info.pause ? 'resumeSuccess' : 'pauseSuccess'}`),
            failureMessage: t(`tokenManage.simpleControl.actions.pause.${info.pause ? 'resumeFailed' : 'pauseFailed'}`),
          })
        }
      >
        {t(`tokenManage.simpleControl.actions.pause.${info.pause ? 'resume' : 'pause'}`)}
      </Button>
      {!info.enablePause ? <small className="field-error manage-disabled-note">{t('tokenManage.errors.pauseDisabled')}</small> : null}
    </article>
  )
}

function WalletLimitCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: SimpleControlTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: ActionConfig) => void
}) {
  const [amount, setAmount] = useState(info.maxWalletAmountDisplay)
  const amountError = validateAmountInput(amount, info.decimals, t)

  return (
    <article className="manage-operation-card">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.simpleControl.actions.walletLimit.title')}</h4>
        <p>{t('tokenManage.simpleControl.actions.walletLimit.description')}</p>
      </div>
      <InlineActionRow
        label={t('tokenManage.simpleControl.fields.maxWalletAmount')}
        currentValue={(
          <ValueWithTooltip
            value={formatCompactTokenAmount(info.maxWalletAmount, info.decimals)}
            fullValue={formatFullTokenAmount(info.maxWalletAmount, info.decimals)}
          />
        )}
        control={
          <Input
            className="token-form-input"
            placeholder={t('tokenManage.placeholder')}
            status={amountError ? 'error' : undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        }
        buttonText={t('tokenManage.actionButtons.edit')}
        disabled={disabled || !info.enableWalletLimit || loadingKey === 'maxWalletAmount'}
        onSubmit={() => {
          if (amountError || !amount.trim()) {
            message.warning(amountError ?? t('tokenManage.errors.invalidAmount'))
            return
          }
          const parsed = parseUnits(amount, info.decimals)
          if (parsed > info.totalSupply) {
            message.warning(t('tokenManage.errors.invalidMaxWalletAmount'))
            return
          }
          onRunAction({
            key: 'maxWalletAmount',
            title: t('tokenManage.simpleControl.actions.walletLimit.update'),
            functionName: 'setMaxWalletAmount',
            args: [parsed],
            successMessage: t('tokenManage.simpleControl.actions.walletLimit.updateSuccess'),
            failureMessage: t('tokenManage.simpleControl.actions.walletLimit.updateFailed'),
          })
        }}
      />
      {!info.enableWalletLimit ? <small className="field-error manage-disabled-note">{t('tokenManage.errors.walletLimitDisabled')}</small> : null}
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
  info: SimpleControlTokenManageInfo
  mode: AddressListMode
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: ActionConfig) => void
}) {
  const [operation, setOperation] = useState<AddressListAction>('add')
  const [addressInput, setAddressInput] = useState('')
  const list = mode === 'whitelist' ? info.whitelistAddresses : info.blacklistAddresses
  const enabled = mode === 'whitelist' ? info.whitelistEnabled : info.blacklistEnabled
  const protectedSet = new Set(info.protectedAddresses.map((item) => normalizeTokenAddress(item)))
  const protectedItems = mode === 'whitelist' ? list.filter((item) => protectedSet.has(normalizeTokenAddress(item))) : []
  const editableItems = mode === 'whitelist' ? list.filter((item) => !protectedSet.has(normalizeTokenAddress(item))) : list
  const clearableCount = editableItems.length
  const addDisabled = !enabled && operation === 'add'

  function handleSubmit() {
    const parsedAddresses = parseAddressTextArea(addressInput)
    if (parsedAddresses.length === 0 || parsedAddresses.some((item) => !isValidAddress(item))) {
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
    } else if (missingInputAddresses.length > 0) {
      message.warning(t('tokenManage.errors.addressesNotInList', { count: missingInputAddresses.length }))
      return
    }

    onRunAction({
      key: `${mode}-${operation}`,
      title: t(`tokenManage.actions.${mode}.title`),
      functionName: mode === 'whitelist' ? 'batchSetWhitelist' : 'batchSetBlacklist',
      args: [submitAddresses, operation === 'add'],
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
          disabled={disabled}
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
          disabled={disabled || addDisabled}
          placeholder={t('tokenManage.list.addressInputPlaceholder')}
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
        />
        <Button type="primary" disabled={disabled || addDisabled || loadingKey === `${mode}-${operation}`} onClick={handleSubmit}>
          {t(`tokenManage.actions.${mode}.${operation}`)}
        </Button>
        <Button danger disabled={disabled || clearableCount === 0 || loadingKey === `${mode}-clear`} onClick={handleClearList}>
          {t(`tokenManage.actions.${mode}.clear`)}
        </Button>
      </div>
      {!enabled ? (
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
  chainDefinition,
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  chainDefinition: ReturnType<typeof useRouteContext>['chainDefinition']
  info: SimpleControlTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: ActionConfig) => void
}) {
  const [nextOwner, setNextOwner] = useState('')

  return (
    <article className="manage-operation-card manage-operation-card-wide">
      <div className="manage-operation-copy">
        <h4>{t('tokenManage.actions.transferOwnership.title')}</h4>
        <p>{t('tokenManage.simpleControl.actions.transferOwnership.description')}</p>
      </div>
      <div className="manage-inline-summary manage-current-address-summary">
        <span>{t('tokenManage.actions.transferOwnership.current')}</span>
        <InlineAddressValue chainDefinition={chainDefinition} address={info.owner} ariaLabel={t('tokenManage.actions.transferOwnership.current')} />
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

function DangerZoneCard({
  info,
  t,
  disabled,
  loadingKey,
  onRunAction,
}: {
  info: SimpleControlTokenManageInfo
  t: (key: string, vars?: Record<string, string | number>) => string
  disabled: boolean
  loadingKey: string | null
  onRunAction: (config: ActionConfig) => void
}) {
  const actions = [
    {
      key: 'disableWhitelist',
      label: t('tokenManage.danger.whitelistFeature'),
      description: t('tokenSimpleControlCreation.overview.cards.limits.description'),
      enabled: info.whitelistEnabled,
      functionName: 'disableWhitelist',
      buttonText: info.whitelistEnabled ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.danger.disableWhitelistSuccess'),
      failureMessage: t('tokenManage.danger.disableWhitelistFailed'),
    },
    {
      key: 'disableBlacklist',
      label: t('tokenManage.danger.blacklistFeature'),
      description: t('tokenSimpleControlCreation.labels.blacklistEnabledNote'),
      enabled: info.blacklistEnabled,
      functionName: 'disableBlacklist',
      buttonText: info.blacklistEnabled ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.danger.disableBlacklistSuccess'),
      failureMessage: t('tokenManage.danger.disableBlacklistFailed'),
    },
    {
      key: 'disableWalletLimit',
      label: t('tokenManage.simpleControl.fields.walletLimitFeature'),
      description: t('tokenSimpleControlCreation.labels.enableWalletLimitNote'),
      enabled: info.enableWalletLimit,
      functionName: 'disableWalletLimit',
      buttonText: info.enableWalletLimit ? t('tokenManage.danger.closeAction') : t('tokenManage.danger.closedAction'),
      successMessage: t('tokenManage.simpleControl.actions.walletLimit.disableSuccess'),
      failureMessage: t('tokenManage.simpleControl.actions.walletLimit.disableFailed'),
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
        icon={<ExclamationCircleFilled />}
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
                args: [],
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
  label,
  currentValue,
  control,
  buttonText,
  disabled,
  onSubmit,
}: {
  label: string
  currentValue: ReactNode
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

type ActionConfig = {
  key: string
  title: string
  functionName: string
  args: unknown[]
  successMessage: string
  failureMessage: string
}

function buildSimpleSupplyCards(info: SimpleControlTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
  return [
    {
      key: 'totalSupply',
      label: t('tokenManage.header.totalSupply'),
      value: formatCompactTokenAmount(info.totalSupply, info.decimals),
      fullValue: formatFullTokenAmount(info.totalSupply, info.decimals),
    },
    { key: 'mintEnabled', label: t('tokenManage.infoFields.mintEnabled'), value: formatEnabledLabel(info.enableMint, t) },
  ]
}

function buildSimpleControlCards(info: SimpleControlTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
  return [
    { key: 'pauseEnabled', label: t('tokenManage.simpleControl.fields.pauseFeature'), value: formatEnabledLabel(info.enablePause, t) },
    { key: 'pause', label: t('tokenManage.simpleControl.fields.pauseStatus'), value: info.pause ? t('tokenManage.header.paused') : t('tokenManage.header.notPaused') },
    { key: 'walletLimitEnabled', label: t('tokenManage.simpleControl.fields.walletLimitFeature'), value: formatEnabledLabel(info.enableWalletLimit, t) },
    {
      key: 'maxWalletAmount',
      label: t('tokenManage.simpleControl.fields.maxWalletAmount'),
      value: formatCompactTokenAmount(info.maxWalletAmount, info.decimals),
      fullValue: formatFullTokenAmount(info.maxWalletAmount, info.decimals),
    },
  ]
}

function buildSimpleListCards(info: SimpleControlTokenManageInfo, t: (key: string, vars?: Record<string, string | number>) => string): ManageStatCard[] {
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

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

function parseAddressTextArea(value: string) {
  return value
    .split(/[\r\n,;]+/)
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

function formatEnabledLabel(value: boolean, t: (key: string, vars?: Record<string, string | number>) => string) {
  return value ? t('tokenManage.header.enabled') : t('tokenManage.header.disabled')
}

function validateAmountInput(
  value: string,
  decimals: number,
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
    if (parseUnits(normalized, decimals) <= 0n) {
      return t('tokenManage.errors.invalidAmount')
    }
  } catch {
    return t('tokenManage.errors.invalidAmount')
  }
  return null
}
