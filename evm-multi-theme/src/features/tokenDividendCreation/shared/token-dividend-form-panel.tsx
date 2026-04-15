import { CheckCircleFilled, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Input, InputNumber, Select, Switch } from 'antd'
import type { SyntheticEvent } from 'react'
import { TokenDisplay } from '@/components/common/token-display'
import { AppModal } from '@/components/common/modal'
import { OperationStatus } from '@/components/common/operation-status'
import { OperationWarning } from '@/components/common/operation-warning'
import { CopyButton } from '@/components/common/copy-button'
import { getExplorerUrl } from '@/config/chains'
import { formatNativeAmount, formatText } from '@/utils'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import type { DividendExchangeOption, TokenDividendViewModel } from '../business/model'
import {
  calcDividendTaxCategoryTotal,
  calcDividendTaxGrandTotal,
  DIVIDEND_TAX_PREFIXES,
  DIVIDEND_TAX_SUFFIXES,
  MAX_DIVIDEND_TAX_PER_GROUP,
  MAX_DIVIDEND_TAX_TOTAL,
  MEDIUM_DIVIDEND_TAX_HINT,
} from '../business/tax'
import { TokenDividendSummary } from './token-dividend-summary'

const FALLBACK_ICON_SRC = '/img/common/icon-fallback.svg'

export function TokenDividendFormPanel({ model }: { model: TokenDividendViewModel }) {
  const {
    t,
    chainDefinition,
    formValues,
    errors,
    exchanges,
    poolTokens,
    rewardTokens,
    creationFee,
    feeLoading,
    loading,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    updateField,
    onPoolTokenResolved,
    onRewardTokenResolved,
    onSubmit,
    onCancelFlow,
    onCloseSuccessModal,
    onCloseFailureModal,
    onClearResult,
  } = model

  const txExplorerUrl = getExplorerUrl(chainDefinition, 'hash', result?.txHash)
  const tokenExplorerUrl = getExplorerUrl(chainDefinition, 'token', result?.tokenAddress)
  const exchangeTooltip = t('tokenDividendCreation.tooltips.exchange')
  const exchangeDisabled = exchanges.length === 0

  return (
    <section className="surface-card form-card dividend-form-card">
      {exchangeDisabled ? (
        <Alert
          className="dividend-warning-banner"
          message={t('tokenDividendCreation.status.factoryUnavailable')}
          type="warning"
          showIcon
        />
      ) : null}

      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenDividendCreation.fields.name')} tooltip={t('tokenDividendCreation.tooltips.name')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenDividendCreation.placeholders.name')}
            value={formValues.name}
            maxLength={100}
            allowClear
            onChange={(event) => updateField('name', event.target.value)}
            status={errors.name ? 'error' : undefined}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenDividendCreation.fields.symbol')} tooltip={t('tokenDividendCreation.tooltips.symbol')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenDividendCreation.placeholders.symbol')}
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
            label={t('tokenDividendCreation.fields.totalSupply')}
            tooltip={t('tokenDividendCreation.tooltips.totalSupply')}
          />
          <InputNumber
            className="token-form-number"
            controls={false}
            parser={(value) => value?.replace(/[^\d]/g, '') || ''}
            placeholder={t('tokenDividendCreation.placeholders.totalSupply')}
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
          <FieldLabelWithTooltip
            label={t('tokenDividendCreation.fields.decimals')}
            tooltip={t('tokenDividendCreation.tooltips.decimals')}
          />
          <InputNumber
            className="token-form-number"
            controls={false}
            max={18}
            min={0}
            placeholder={t('tokenDividendCreation.placeholders.decimals')}
            style={{ width: '100%' }}
            value={formValues.decimals}
            onChange={(value) => updateField('decimals', value == null ? null : Number(value))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>
      </div>

      <section className="dividend-mode-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenDividendCreation.labels.modeTitle')}</strong>
          <p>{t('tokenDividendCreation.labels.modeDescription')}</p>
        </div>

        <Alert
          className="dividend-mode-alert"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={formValues.isSameTokenDividend ? t('tokenDividendCreation.modes.sameToken') : t('tokenDividendCreation.modes.externalToken')}
          description={
            formValues.isSameTokenDividend
              ? t('tokenDividendCreation.labels.sameTokenModeHelp')
              : t('tokenDividendCreation.labels.externalTokenModeHelp')
          }
        />

        <div className="switch-row">
          <div className="switch-copy">
            <strong>{t('tokenDividendCreation.fields.isSameTokenDividend')}</strong>
            <p>{t('tokenDividendCreation.tooltips.isSameTokenDividend')}</p>
          </div>
          <Switch
            checked={formValues.isSameTokenDividend}
            onChange={(checked) => {
              updateField('isSameTokenDividend', checked)
              if (checked) {
                updateField('dividendToken', '')
              }
            }}
          />
        </div>

        <div className="field-grid tax-field-grid">
          <label className="field">
            <FieldLabelWithTooltip label={t('tokenDividendCreation.fields.exchange')} tooltip={exchangeTooltip} />
            <Select
              className="tax-exchange-select"
              optionLabelProp="label"
              placeholder={t('tokenDividendCreation.placeholders.exchange')}
              disabled={exchangeDisabled}
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
              label={t('tokenDividendCreation.fields.poolToken')}
              tooltip={t('tokenDividendCreation.tooltips.poolToken', {
                nativeSymbol: chainDefinition.nativeToken.symbol,
              })}
            />
            <TokenDisplay
              allowCustomAddress
              chainDefinition={chainDefinition}
              emptyText={t('tokenDividendCreation.status.emptyTokenList')}
              lookupErrorText={t('tokenDividendCreation.errors.tokenLookupFailed')}
              nativeLabel={t('common.nativeToken')}
              noTokenInfoText={t('tokenDividendCreation.status.noTokenInfo')}
              onChange={(nextValue) => updateField('poolToken', nextValue)}
              onTokenResolved={onPoolTokenResolved}
              placeholder={t('tokenDividendCreation.placeholders.poolToken')}
              searchingText={t('tokenDividendCreation.status.searchingToken')}
              status={errors.poolToken ? 'error' : undefined}
              tokens={poolTokens}
              value={formValues.poolToken}
            />
            {errors.poolToken ? <small className="field-error">{errors.poolToken}</small> : null}
          </label>

          {!formValues.isSameTokenDividend ? (
            <label className="field field-span-full">
              <FieldLabelWithTooltip
                label={t('tokenDividendCreation.fields.dividendToken')}
                tooltip={t('tokenDividendCreation.tooltips.dividendToken')}
              />
              <TokenDisplay
                allowCustomAddress
                chainDefinition={chainDefinition}
                emptyText={t('tokenDividendCreation.status.emptyTokenList')}
                lookupErrorText={t('tokenDividendCreation.errors.tokenLookupFailed')}
                nativeLabel={t('common.nativeToken')}
                noTokenInfoText={t('tokenDividendCreation.status.noTokenInfo')}
                onChange={(nextValue) => updateField('dividendToken', nextValue)}
                onTokenResolved={onRewardTokenResolved}
                placeholder={t('tokenDividendCreation.placeholders.dividendToken')}
                searchingText={t('tokenDividendCreation.status.searchingToken')}
                status={errors.dividendToken ? 'error' : undefined}
                tokens={rewardTokens}
                value={formValues.dividendToken}
              />
              {errors.dividendToken ? <small className="field-error">{errors.dividendToken}</small> : null}
            </label>
          ) : null}
        </div>
      </section>

      <section className="dividend-parameter-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenDividendCreation.labels.distributionRules')}</strong>
          <p>{t('tokenDividendCreation.labels.distributionRulesNote')}</p>
        </div>

        <div className="field-grid">
          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.receiveAddress')}
              tooltip={t('tokenDividendCreation.tooltips.receiveAddress')}
            />
            <Input
              className="token-form-input"
              placeholder={t('tokenDividendCreation.placeholders.receiveAddress')}
              value={formValues.receiveAddress}
              allowClear
              onChange={(event) => updateField('receiveAddress', event.target.value)}
              status={errors.receiveAddress ? 'error' : undefined}
            />
            {errors.receiveAddress ? <small className="field-error">{errors.receiveAddress}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.fundAddress')}
              tooltip={t('tokenDividendCreation.tooltips.fundAddress')}
            />
            <Input
              className="token-form-input"
              placeholder={t('tokenDividendCreation.placeholders.fundAddress')}
              value={formValues.fundAddress}
              allowClear
              onChange={(event) => updateField('fundAddress', event.target.value)}
              status={errors.fundAddress ? 'error' : undefined}
            />
            {errors.fundAddress ? <small className="field-error">{errors.fundAddress}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.minHoldingForDividend')}
              tooltip={t('tokenDividendCreation.tooltips.minHoldingForDividend')}
            />
            <Input
              className="token-form-input"
              placeholder={t('tokenDividendCreation.placeholders.minHoldingForDividend')}
              value={formValues.minHoldingForDividend}
              allowClear
              onChange={(event) => updateField('minHoldingForDividend', event.target.value)}
              status={errors.minHoldingForDividend ? 'error' : undefined}
            />
            {errors.minHoldingForDividend ? <small className="field-error">{errors.minHoldingForDividend}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.dividendTriggerThreshold')}
              tooltip={t('tokenDividendCreation.tooltips.dividendTriggerThreshold')}
            />
            <Input
              className="token-form-input"
              placeholder={t('tokenDividendCreation.placeholders.dividendTriggerThreshold')}
              value={formValues.dividendTriggerThreshold}
              allowClear
              onChange={(event) => updateField('dividendTriggerThreshold', event.target.value)}
              status={errors.dividendTriggerThreshold ? 'error' : undefined}
            />
            {errors.dividendTriggerThreshold ? <small className="field-error">{errors.dividendTriggerThreshold}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.autoProcessGasLimit')}
              tooltip={t('tokenDividendCreation.tooltips.autoProcessGasLimit')}
            />
            <InputNumber
              className="token-form-number"
              controls={false}
              min="1"
              precision={0}
              stringMode
              style={{ width: '100%' }}
              placeholder={t('tokenDividendCreation.placeholders.autoProcessGasLimit')}
              value={formValues.autoProcessGasLimit || undefined}
              onChange={(value) => updateField('autoProcessGasLimit', String(value ?? ''))}
              status={errors.autoProcessGasLimit ? 'error' : undefined}
            />
            {errors.autoProcessGasLimit ? <small className="field-error">{errors.autoProcessGasLimit}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.killBlockCount')}
              tooltip={t('tokenDividendCreation.tooltips.killBlockCount')}
            />
            <InputNumber
              className="token-form-number"
              controls={false}
              min="0"
              precision={0}
              stringMode
              style={{ width: '100%' }}
              placeholder={t('tokenDividendCreation.placeholders.killBlockCount')}
              value={formValues.killBlockCount || undefined}
              onChange={(value) => updateField('killBlockCount', String(value ?? ''))}
              status={errors.killBlockCount ? 'error' : undefined}
            />
            {errors.killBlockCount ? <small className="field-error">{errors.killBlockCount}</small> : null}
          </label>
        </div>
      </section>

      <section className="dividend-tax-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenDividendCreation.labels.taxConfiguration')}</strong>
          <p>{t('tokenDividendCreation.labels.taxConfigurationNote')}</p>
        </div>

        <div className="tax-group-grid">
          {DIVIDEND_TAX_PREFIXES.map((prefix) => {
            const categoryTotal = calcDividendTaxCategoryTotal(formValues, prefix)
            const isGroupWarning = categoryTotal >= MEDIUM_DIVIDEND_TAX_HINT && categoryTotal < MAX_DIVIDEND_TAX_PER_GROUP
            const isGroupExceeded = categoryTotal > MAX_DIVIDEND_TAX_PER_GROUP

            return (
              <section className={`dividend-tax-card ${isGroupExceeded ? 'is-error' : ''}`} key={prefix}>
                <div className="dividend-tax-card-head">
                  <div>
                    <strong>{t(`tokenDividendCreation.taxGroups.${prefix}`)}</strong>
                    <p>{t(`tokenDividendCreation.taxGroupDescriptions.${prefix}`)}</p>
                  </div>
                  <span className={`tax-total-pill ${isGroupWarning ? 'is-warning' : ''} ${isGroupExceeded ? 'is-error' : ''}`}>
                    {categoryTotal}%
                  </span>
                </div>

                <div className="dividend-tax-field-grid">
                  {DIVIDEND_TAX_SUFFIXES.map((suffix) => {
                    const fieldKey = `${prefix}${suffix}` as const
                    return (
                      <label className="field" key={fieldKey}>
                        <FieldLabelWithTooltip
                          label={t(`tokenDividendCreation.taxFields.${suffix}`)}
                          tooltip={t(`tokenDividendCreation.taxTooltips.${suffix}`)}
                        />
                        <Input
                          className="token-form-input tax-percent-input"
                          placeholder="0"
                          suffix={<span className="tax-percent-suffix">%</span>}
                          value={formValues[fieldKey]}
                          onChange={(event) => updateField(fieldKey, event.target.value)}
                          status={errors[fieldKey] ? 'error' : undefined}
                        />
                        {errors[fieldKey] ? <small className="field-error">{errors[fieldKey]}</small> : null}
                      </label>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="tax-total-bar">
          <span>{t('tokenDividendCreation.labels.totalTaxRate')}</span>
          <strong className={calcDividendTaxGrandTotal(formValues) > MAX_DIVIDEND_TAX_TOTAL ? 'is-error' : ''}>
            {calcDividendTaxGrandTotal(formValues)}%
          </strong>
        </div>
        {errors.taxConfiguration ? <small className="field-error">{errors.taxConfiguration}</small> : null}
      </section>

      <section className="dividend-permission-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenDividendCreation.labels.permissionControls')}</strong>
          <p>{t('tokenDividendCreation.labels.permissionControlsNote')}</p>
        </div>

        <div className="switch-grid">
          <div className="switch-row">
            <div className="switch-copy">
              <strong>{t('tokenDividendCreation.fields.mintEnabled')}</strong>
              <p>{t('tokenDividendCreation.tooltips.mintEnabled')}</p>
            </div>
            <Switch checked={formValues.mintEnabled} onChange={(checked) => updateField('mintEnabled', checked)} />
          </div>

          <div className="switch-row">
            <div className="switch-copy">
              <strong>{t('tokenDividendCreation.fields.manualTradingEnable')}</strong>
              <p>{t('tokenDividendCreation.tooltips.manualTradingEnable')}</p>
            </div>
            <Switch checked={formValues.manualTradingEnable} onChange={(checked) => updateField('manualTradingEnable', checked)} />
          </div>

          <div className="switch-row">
            <div className="switch-copy">
              <strong>{t('tokenDividendCreation.fields.whitelistEnabled')}</strong>
              <p>{t('tokenDividendCreation.tooltips.whitelistEnabled')}</p>
            </div>
            <Switch checked={formValues.whitelistEnabled} onChange={(checked) => updateField('whitelistEnabled', checked)} />
          </div>

          <div className="switch-row">
            <div className="switch-copy">
              <strong>{t('tokenDividendCreation.fields.blacklistEnabled')}</strong>
              <p>{t('tokenDividendCreation.tooltips.blacklistEnabled')}</p>
            </div>
            <Switch checked={formValues.blacklistEnabled} onChange={(checked) => updateField('blacklistEnabled', checked)} />
          </div>
        </div>

        {formValues.whitelistEnabled ? (
          <label className="field field-span-full">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.initialWhitelist')}
              tooltip={t('tokenDividendCreation.tooltips.initialWhitelist')}
            />
            <Input.TextArea
              className="address-textarea"
              placeholder={t('tokenDividendCreation.placeholders.initialWhitelist')}
              value={formValues.initialWhitelist}
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={(event) => updateField('initialWhitelist', event.target.value)}
              status={errors.initialWhitelist ? 'error' : undefined}
            />
            {errors.initialWhitelist ? <small className="field-error">{errors.initialWhitelist}</small> : null}
          </label>
        ) : null}

        {formValues.blacklistEnabled ? (
          <label className="field field-span-full">
            <FieldLabelWithTooltip
              label={t('tokenDividendCreation.fields.initialBlacklist')}
              tooltip={t('tokenDividendCreation.tooltips.initialBlacklist')}
            />
            <Input.TextArea
              className="address-textarea"
              placeholder={t('tokenDividendCreation.placeholders.initialBlacklist')}
              value={formValues.initialBlacklist}
              autoSize={{ minRows: 4, maxRows: 8 }}
              onChange={(event) => updateField('initialBlacklist', event.target.value)}
              status={errors.initialBlacklist ? 'error' : undefined}
            />
            {errors.initialBlacklist ? <small className="field-error">{errors.initialBlacklist}</small> : null}
          </label>
        ) : null}
      </section>

      <Button
        block
        className="primary-button ant-primary-button"
        disabled={exchangeDisabled}
        loading={loading}
        onClick={() => void onSubmit()}
        type="primary"
        size="large"
      >
        {loading ? t('tokenDividendCreation.actions.submitting') : t('tokenDividendCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note fee-inline-note-after-submit">
        <FieldLabelWithTooltip
          label={t('tokenDividendCreation.labels.creationFee')}
          tooltip={t('tokenDividendCreation.tooltips.creationFee')}
        />
        <strong>{feeLoading || creationFee == null ? '...' : `${formatNativeAmount(creationFee)} ${chainDefinition.nativeToken.symbol}`}</strong>
      </div>

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-card-head">
            <div className="success-banner">
              <CheckCircleFilled />
              <span>{t('tokenDividendCreation.success.banner')}</span>
            </div>
            <button className="result-close-button" onClick={onClearResult} type="button" aria-label={t('tokenDividendCreation.actions.close')}>
              <CloseOutlined />
            </button>
          </div>
          <TokenDividendSummary
            chainDefinition={chainDefinition}
            exchanges={exchanges}
            formValues={formValues}
            poolTokens={poolTokens}
            result={result}
            rewardTokens={rewardTokens}
            t={t}
          />
        </div>
      ) : null}

      <OperationStatus
        open={Boolean(submitStep)}
        title={t('tokenDividendCreation.modal.progressTitle')}
        step={submitStep}
        steps={[
          { id: 1, text: t('tokenDividendCreation.steps.preparing') },
          { id: 2, text: t('tokenDividendCreation.steps.waitingWallet') },
          { id: 3, text: t('tokenDividendCreation.steps.pending') },
          { id: 4, text: t('tokenDividendCreation.steps.completed'), errorText: t('tokenDividendCreation.steps.failed') },
        ]}
        cancelBtnShow={submitStep?.id === 1 || submitStep?.id === 2}
        onClose={onCancelFlow}
      />

      <AppModal
        className="token-result-modal"
        footer={<Button type="primary" onClick={onCloseSuccessModal}>{t('tokenDividendCreation.actions.close')}</Button>}
        onCancel={onCloseSuccessModal}
        open={successModalOpen}
        title={<div className="token-result-modal-heading">{t('tokenDividendCreation.modal.successTitle')}</div>}
      >
        <div className="result-modal-shell">
          <div className="result-modal-card">
            <div className="result-modal-row">
              <span>{t('tokenDividendCreation.success.tokenAddress')}</span>
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
              <span>{t('tokenDividendCreation.success.txHash')}</span>
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
        footer={
          <>
            <Button onClick={onCloseFailureModal}>{t('tokenDividendCreation.actions.close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                onCloseFailureModal()
                void onSubmit()
              }}
            >
              {t('tokenDividendCreation.actions.retry')}
            </Button>
          </>
        }
        labelText={t('common.exception.possibleReasons')}
        noteText={t('common.exception.contactOfficialSupport')}
        onClose={onCloseFailureModal}
        open={failureModalOpen}
        title={t('tokenDividendCreation.modal.errorTitle')}
      />
    </section>
  )
}

function buildExchangeSelectedLabel(exchange: DividendExchangeOption) {
  return (
    <span className="tax-exchange-selected">
      <span className="tax-exchange-badge" aria-hidden="true">
        {exchange.logo ? <img alt={exchange.label} onError={handleAssetImageError} src={exchange.logo} /> : getExchangeBadgeText(exchange)}
      </span>
      <span className="tax-exchange-selected-name">{exchange.label}</span>
    </span>
  )
}

function buildExchangeOptionLabel(exchange: DividendExchangeOption) {
  return (
    <div className="tax-exchange-option">
      <div className="tax-exchange-option-main">
        <span className="tax-exchange-badge" aria-hidden="true">
          {exchange.logo ? <img alt={exchange.label} onError={handleAssetImageError} src={exchange.logo} /> : getExchangeBadgeText(exchange)}
        </span>
        <span className="tax-exchange-option-name">{exchange.label}</span>
      </div>
    </div>
  )
}

function getExchangeBadgeText(exchange: DividendExchangeOption) {
  return exchange.dex.slice(0, 2).toUpperCase()
}

function handleAssetImageError(event: SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget
  target.onerror = null
  target.src = FALLBACK_ICON_SRC
}
