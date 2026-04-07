import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber, Select } from 'antd'
import type { SyntheticEvent } from 'react'
import { TokenDisplay } from '@/components/common/token-display'
import { getExplorerUrl } from '@/config/chains'
import { AppModal } from '@/components/common/modal'
import { OperationStatus } from '@/components/common/operation-status'
import { OperationWarning } from '@/components/common/operation-warning'
import { formatNativeAmount, formatText } from '@/utils'
import { CopyButton } from '@/components/common/copy-button'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import { TokenCreationSummary } from '@/features/tokenCreation/shared/token-creation-summary'
import type { TaxExchangeOption, TokenTaxViewModel } from '../business/model'

const FALLBACK_ICON_SRC = '/img/common/icon-fallback.svg'

export function TokenTaxFormPanel({ model }: { model: TokenTaxViewModel }) {
  const {
    t,
    chainDefinition,
    formValues,
    errors,
    exchanges,
    poolTokens,
    creationFee,
    feeLoading,
    loading,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    updateField,
    onPoolTokenResolved,
    onSubmit,
    onCancelFlow,
    onCloseSuccessModal,
    onCloseFailureModal,
    onClearResult,
  } = model
  const txExplorerUrl = getExplorerUrl(chainDefinition, 'hash', result?.txHash)
  const tokenExplorerUrl = getExplorerUrl(chainDefinition, 'token', result?.tokenAddress)
  const defaultStableSymbol = chainDefinition.stableCoins?.[0]?.symbol ?? chainDefinition.nativeToken.symbol

  return (
    <section className="surface-card form-card tax-form-card">
      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.name')} tooltip={t('tokenTaxCreation.tooltips.name')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenTaxCreation.placeholders.name')}
            value={formValues.name}
            maxLength={100}
            allowClear
            onChange={(event) => updateField('name', event.target.value)}
            status={errors.name ? 'error' : undefined}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.symbol')} tooltip={t('tokenTaxCreation.tooltips.symbol')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenTaxCreation.placeholders.symbol')}
            value={formValues.symbol}
            maxLength={100}
            allowClear
            onChange={(event) => updateField('symbol', event.target.value)}
            status={errors.symbol ? 'error' : undefined}
          />
          {errors.symbol ? <small className="field-error">{errors.symbol}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip
            label={t('tokenTaxCreation.fields.totalSupply')}
            tooltip={t('tokenTaxCreation.tooltips.totalSupply')}
          />
          <InputNumber
            className="token-form-number"
            controls={false}
            parser={(value) => value?.replace(/[^\d]/g, '') || ''}
            placeholder={t('tokenTaxCreation.placeholders.totalSupply')}
            precision={0}
            stringMode
            style={{ width: '100%' }}
            value={formValues.totalSupply}
            onChange={(value) => updateField('totalSupply', String(value ?? ''))}
            status={errors.totalSupply ? 'error' : undefined}
          />
          {errors.totalSupply ? <small className="field-error">{errors.totalSupply}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.decimals')} tooltip={t('tokenTaxCreation.tooltips.decimals')} />
          <InputNumber
            className="token-form-number"
            controls={false}
            max={18}
            min={0}
            placeholder={t('tokenTaxCreation.placeholders.decimals')}
            style={{ width: '100%' }}
            value={formValues.decimals}
            onChange={(value) => updateField('decimals', value == null ? null : Number(value))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>
      </div>

      <section className="tax-settings-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenTaxCreation.labels.taxConfiguration')}</strong>
          <p>{t('tokenTaxCreation.labels.taxConfigurationNote')}</p>
        </div>

        <div className="field-grid tax-field-grid">
          <label className="field">
            <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.buyTax')} tooltip={t('tokenTaxCreation.tooltips.buyTax')} />
            <Input
              className="token-form-input tax-percent-input"
              placeholder={t('tokenTaxCreation.placeholders.buyTax')}
              suffix={<span className="tax-percent-suffix">%</span>}
              value={formValues.buyTax}
              onChange={(event) => updateField('buyTax', event.target.value)}
              status={errors.buyTax ? 'error' : undefined}
            />
            {errors.buyTax ? <small className="field-error">{errors.buyTax}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.sellTax')} tooltip={t('tokenTaxCreation.tooltips.sellTax')} />
            <Input
              className="token-form-input tax-percent-input"
              placeholder={t('tokenTaxCreation.placeholders.sellTax')}
              suffix={<span className="tax-percent-suffix">%</span>}
              value={formValues.sellTax}
              onChange={(event) => updateField('sellTax', event.target.value)}
              status={errors.sellTax ? 'error' : undefined}
            />
            {errors.sellTax ? <small className="field-error">{errors.sellTax}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenTaxCreation.fields.taxReceiver')}
              tooltip={t('tokenTaxCreation.tooltips.taxReceiver')}
            />
            <Input
              className="token-form-input"
              placeholder={t('tokenTaxCreation.placeholders.taxReceiver')}
              value={formValues.taxFeeReceiveAddress}
              allowClear
              onChange={(event) => updateField('taxFeeReceiveAddress', event.target.value)}
              status={errors.taxFeeReceiveAddress ? 'error' : undefined}
            />
            {errors.taxFeeReceiveAddress ? <small className="field-error">{errors.taxFeeReceiveAddress}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip label={t('tokenTaxCreation.fields.exchange')} tooltip={t('tokenTaxCreation.tooltips.exchange')} />
            <Select
              className="tax-exchange-select"
              optionLabelProp="label"
              placeholder={t('tokenTaxCreation.fields.exchange')}
              status={errors.exchange ? 'error' : undefined}
              value={formValues.exchange || undefined}
              classNames={{
                popup: {
                  root: 'tax-exchange-dropdown',
                },
              }}
              onChange={(value) => updateField('exchange', value)}
            >
              {exchanges.map((item) => (
                <Select.Option key={item.value} label={buildExchangeSelectedLabel(item)} value={item.value}>
                  {buildExchangeOptionLabel(item)}
                </Select.Option>
              ))}
            </Select>
            {errors.exchange ? <small className="field-error">{errors.exchange}</small> : null}
          </label>

          <label className="field field-span-full">
            <FieldLabelWithTooltip
              label={t('tokenTaxCreation.fields.poolToken')}
              tooltip={t('tokenTaxCreation.tooltips.poolToken', {
                nativeSymbol: chainDefinition.nativeToken.symbol,
                stableSymbol: defaultStableSymbol,
              })}
            />
            <TokenDisplay
              allowCustomAddress
              chainDefinition={chainDefinition}
              emptyText={t('tokenTaxCreation.placeholders.poolToken')}
              key={chainDefinition.key}
              lookupErrorText={t('tokenTaxCreation.errors.tokenLookupFailed')}
              noTokenInfoText={t('tokenTaxCreation.status.noTokenInfo')}
              nativeLabel={t('common.nativeToken')}
              onChange={(nextValue) => updateField('poolToken', nextValue)}
              onTokenResolved={onPoolTokenResolved}
              placeholder={t('tokenTaxCreation.placeholders.poolToken')}
              searchingText={t('tokenTaxCreation.status.searchingToken')}
              status={errors.poolToken ? 'error' : undefined}
              tokens={poolTokens}
              value={formValues.poolToken}
            />
            {errors.poolToken ? <small className="field-error">{errors.poolToken}</small> : null}
          </label>
        </div>
      </section>

      <Button
        block
        className="primary-button ant-primary-button"
        loading={loading}
        onClick={() => void onSubmit()}
        type="primary"
        size="large"
      >
        {loading ? t('tokenTaxCreation.actions.submitting') : t('tokenTaxCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note fee-inline-note-after-submit">
        <FieldLabelWithTooltip
          label={t('tokenTaxCreation.labels.creationFee')}
          tooltip={t('tokenTaxCreation.tooltips.creationFee')}
        />
        <strong>{feeLoading || creationFee == null ? '...' : `${formatNativeAmount(creationFee)} ${chainDefinition.nativeToken.symbol}`}</strong>
      </div>

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-card-head">
            <div className="success-banner">
              <CheckCircleFilled />
              <span>{t('tokenTaxCreation.success.banner')}</span>
            </div>
            <button className="result-close-button" onClick={onClearResult} type="button" aria-label={t('tokenTaxCreation.actions.close')}>
              <CloseOutlined />
            </button>
          </div>
          <TokenCreationSummary chainDefinition={chainDefinition} result={result} t={t} />
        </div>
      ) : null}

      <OperationStatus
        open={Boolean(submitStep)}
        title={t('tokenTaxCreation.modal.progressTitle')}
        step={submitStep}
        steps={[
          { id: 1, text: t('tokenTaxCreation.steps.preparing') },
          { id: 2, text: t('tokenTaxCreation.steps.waitingWallet') },
          { id: 3, text: t('tokenTaxCreation.steps.pending') },
          { id: 4, text: t('tokenTaxCreation.steps.completed'), errorText: t('tokenTaxCreation.steps.failed') },
        ]}
        cancelBtnShow={submitStep?.id === 1 || submitStep?.id === 2}
        onClose={onCancelFlow}
      />

      <AppModal
        className="token-result-modal"
        footer={<Button type="primary" onClick={onCloseSuccessModal}>{t('tokenTaxCreation.actions.close')}</Button>}
        onCancel={onCloseSuccessModal}
        open={successModalOpen}
        title={<div className="token-result-modal-heading">{t('tokenTaxCreation.modal.successTitle')}</div>}
      >
        <div className="result-modal-shell">
          <div className="result-modal-card">
            <div className="result-modal-row">
              <span>{t('tokenTaxCreation.success.tokenAddress')}</span>
              <div className="result-modal-value">
                {result?.tokenAddress ? (
                  <a className="value-link" href={tokenExplorerUrl} target="_blank" rel="noreferrer">
                    {formatText(result.tokenAddress)}
                  </a>
                ) : (
                  <strong>--</strong>
                )}
                {result?.tokenAddress ? <CopyButton ariaLabel="copy token address" value={result.tokenAddress} /> : null}
              </div>
            </div>
            <div className="result-modal-row">
              <span>{t('tokenTaxCreation.success.txHash')}</span>
              <div className="result-modal-value">
                {result?.txHash ? (
                  <a className="value-link" href={txExplorerUrl} target="_blank" rel="noreferrer">
                    {formatText(result.txHash)}
                  </a>
                ) : (
                  <strong>--</strong>
                )}
                {result?.txHash ? <CopyButton ariaLabel="copy tx hash" value={result.txHash} /> : null}
              </div>
            </div>
          </div>
        </div>
      </AppModal>

      <OperationWarning
        contents={[
          t('common.exception.errorReason1', { chain: chainDefinition.fullName }),
          t('common.exception.errorReason2'),
        ]}
        // description={t('tokenTaxCreation.modal.errorDescription')}
        footer={
          <>
            <Button onClick={onCloseFailureModal}>{t('tokenTaxCreation.actions.close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                onCloseFailureModal()
                void onSubmit()
              }}
            >
              {t('tokenTaxCreation.actions.retry')}
            </Button>
          </>
        }
        labelText={t('common.exception.possibleReasons')}
        noteText={t('common.exception.contactOfficialSupport')}
        onClose={onCloseFailureModal}
        open={failureModalOpen}
        title={t('tokenTaxCreation.modal.errorTitle')}
      />
    </section>
  )
}

function buildExchangeSelectedLabel(exchange: TaxExchangeOption) {
  return (
    <span className="tax-exchange-selected">
      <span className="tax-exchange-badge" aria-hidden="true">
        {exchange.logo ? <img alt={exchange.label} onError={handleAssetImageError} src={exchange.logo} /> : getExchangeBadgeText(exchange)}
      </span>
      <span className="tax-exchange-selected-name">{exchange.label}</span>
    </span>
  )
}

function buildExchangeOptionLabel(exchange: TaxExchangeOption) {
  return (
    <div className="tax-exchange-option">
      <div className="tax-exchange-option-main">
        <span className="tax-exchange-badge" aria-hidden="true">
          {exchange.logo ? <img alt={exchange.label} onError={handleAssetImageError} src={exchange.logo} /> : getExchangeBadgeText(exchange)}
        </span>
        <span className="tax-exchange-option-name">{exchange.label}</span>
      </div>
      {/* <span className="tax-exchange-option-meta">{exchange.version?.toUpperCase() ?? exchange.dex}</span> */}
    </div>
  )
}

function getExchangeBadgeText(exchange: TaxExchangeOption) {
  return exchange.dex.slice(0, 2).toUpperCase()
}

function handleAssetImageError(event: SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget
  target.onerror = null
  target.src = FALLBACK_ICON_SRC
}
