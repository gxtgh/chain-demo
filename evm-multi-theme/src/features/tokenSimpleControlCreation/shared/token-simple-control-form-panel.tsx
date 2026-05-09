import {
  CheckCircleFilled,
  CloseOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, InputNumber, Switch } from 'antd'
import { AppModal } from '@/components/common/modal'
import { OperationStatus } from '@/components/common/operation-status'
import { OperationWarning } from '@/components/common/operation-warning'
import { CopyButton } from '@/components/common/copy-button'
import { getExplorerUrl } from '@/config/chains'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import { formatNativeAmount, formatText } from '@/utils'
import type { TokenSimpleControlViewModel } from '../business/model'

export function TokenSimpleControlFormPanel({ model }: { model: TokenSimpleControlViewModel }) {
  const {
    t,
    chainDefinition,
    connectedAddress,
    formValues,
    errors,
    creationFee,
    feeLoading,
    loading,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    updateField,
    onUseConnectedAddress,
    onSubmit,
    onCancelFlow,
    onCloseSuccessModal,
    onCloseFailureModal,
    onClearResult,
  } = model
  const txExplorerUrl = getExplorerUrl(chainDefinition, 'hash', result?.txHash)
  const tokenExplorerUrl = getExplorerUrl(chainDefinition, 'token', result?.tokenAddress)

  return (
    <section className="surface-card form-card simple-control-form-card">
      {!feeLoading && creationFee == null ? (
        <Alert
          message={t('tokenSimpleControlCreation.status.factoryUnavailable')}
          showIcon
          type="warning"
        />
      ) : null}

      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip
            label={t('tokenSimpleControlCreation.fields.name')}
            tooltip={t('tokenSimpleControlCreation.tooltips.name')}
          />
          <Input
            allowClear
            className="token-form-input"
            maxLength={100}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={t('tokenSimpleControlCreation.placeholders.name')}
            status={errors.name ? 'error' : undefined}
            value={formValues.name}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip
            label={t('tokenSimpleControlCreation.fields.symbol')}
            tooltip={t('tokenSimpleControlCreation.tooltips.symbol')}
          />
          <Input
            allowClear
            className="token-form-input"
            maxLength={100}
            onChange={(event) => updateField('symbol', event.target.value)}
            placeholder={t('tokenSimpleControlCreation.placeholders.symbol')}
            status={errors.symbol ? 'error' : undefined}
            value={formValues.symbol}
          />
          {errors.symbol ? <small className="field-error">{errors.symbol}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip
            label={t('tokenSimpleControlCreation.fields.totalSupply')}
            tooltip={t('tokenSimpleControlCreation.tooltips.totalSupply')}
          />
          <InputNumber
            className="token-form-number"
            controls={false}
            parser={(value) => value?.replace(/[^\d.]/g, '') || ''}
            placeholder={t('tokenSimpleControlCreation.placeholders.totalSupply')}
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
            label={t('tokenSimpleControlCreation.fields.decimals')}
            tooltip={t('tokenSimpleControlCreation.tooltips.decimals')}
          />
          <InputNumber
            className="token-form-number"
            controls={false}
            max={18}
            min={0}
            placeholder={t('tokenSimpleControlCreation.placeholders.decimals')}
            style={{ width: '100%' }}
            value={formValues.decimals}
            onChange={(value) => updateField('decimals', value == null ? null : Number(value))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>
      </div>

      <label className="field field-span-full">
        <FieldLabelWithTooltip
          label={t('tokenSimpleControlCreation.fields.receiveAddress')}
          tooltip={t('tokenSimpleControlCreation.tooltips.receiveAddress')}
        />
        <Input
          allowClear
          className="token-form-input simple-control-address-input"
          onChange={(event) => updateField('receiveAddress', event.target.value)}
          placeholder={t('tokenSimpleControlCreation.placeholders.receiveAddress')}
          status={errors.receiveAddress ? 'error' : undefined}
          value={formValues.receiveAddress}
          suffix={
            <Button
              className="inline-field-button"
              disabled={!connectedAddress}
              onClick={onUseConnectedAddress}
              size="small"
              type="text"
            >
              {t('tokenSimpleControlCreation.actions.useCurrentWallet')}
            </Button>
          }
        />
        {errors.receiveAddress ? <small className="field-error">{errors.receiveAddress}</small> : null}
      </label>

      <section className="simple-control-settings-panel">
        <div className="tax-section-copy">
          <strong>{t('tokenSimpleControlCreation.labels.permissionConfiguration')}</strong>
        </div>

        <div className="switch-grid">
          <div className="switch-card">
            <div className="switch-row">
              <div className="switch-copy">
                <strong>{t('tokenSimpleControlCreation.fields.enableMint')}</strong>
                <p>{t('tokenSimpleControlCreation.labels.enableMintNote')}</p>
              </div>
              <Switch checked={formValues.enableMint} onChange={(checked) => updateField('enableMint', checked)} />
            </div>
          </div>

          <div className="switch-card">
            <div className="switch-row">
              <div className="switch-copy">
                <strong>{t('tokenSimpleControlCreation.fields.enablePause')}</strong>
                <p>{t('tokenSimpleControlCreation.labels.enablePauseNote')}</p>
              </div>
              <Switch checked={formValues.enablePause} onChange={(checked) => updateField('enablePause', checked)} />
            </div>
          </div>

          <div className="switch-card">
            <div className="switch-row">
              <div className="switch-copy">
                <strong>{t('tokenSimpleControlCreation.fields.blacklistEnabled')}</strong>
                <p>{t('tokenSimpleControlCreation.labels.blacklistEnabledNote')}</p>
              </div>
              <Switch checked={formValues.blacklistEnabled} onChange={(checked) => updateField('blacklistEnabled', checked)} />
            </div>
          </div>

          <div className="switch-card">
            <div className="switch-row">
              <div className="switch-copy">
                <strong>{t('tokenSimpleControlCreation.fields.enableWalletLimit')}</strong>
                <p>{t('tokenSimpleControlCreation.labels.enableWalletLimitNote')}</p>
              </div>
              <Switch checked={formValues.enableWalletLimit} onChange={(checked) => updateField('enableWalletLimit', checked)} />
            </div>

            {formValues.enableWalletLimit ? (
              <div className="switch-card-content">
                <label className="field wallet-limit-field">
                  <FieldLabelWithTooltip
                    label={t('tokenSimpleControlCreation.fields.maxWalletAmount')}
                    tooltip={t('tokenSimpleControlCreation.tooltips.maxWalletAmount')}
                  />
                  <InputNumber
                    className="token-form-number"
                    controls={false}
                    parser={(value) => value?.replace(/[^\d.]/g, '') || ''}
                    placeholder={t('tokenSimpleControlCreation.placeholders.maxWalletAmount')}
                    stringMode
                    style={{ width: '100%' }}
                    value={formValues.maxWalletAmount}
                    onChange={(value) => updateField('maxWalletAmount', String(value ?? ''))}
                    status={errors.maxWalletAmount ? 'error' : undefined}
                  />
                  {errors.maxWalletAmount ? <small className="field-error">{errors.maxWalletAmount}</small> : null}
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Button
        block
        className="primary-button ant-primary-button"
        disabled={!feeLoading && creationFee == null}
        loading={loading}
        onClick={() => void onSubmit()}
        size="large"
        type="primary"
      >
        {loading ? t('tokenSimpleControlCreation.actions.submitting') : t('tokenSimpleControlCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note fee-inline-note-after-submit">
        <FieldLabelWithTooltip
          label={t('tokenSimpleControlCreation.labels.creationFee')}
          tooltip={t('tokenSimpleControlCreation.tooltips.creationFee')}
        />
        <strong>{feeLoading || creationFee == null ? '...' : `${formatNativeAmount(creationFee)} ${chainDefinition.nativeToken.symbol}`}</strong>
      </div>

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-card-head">
            <div className="success-banner">
              <CheckCircleFilled />
              <span>{t('tokenSimpleControlCreation.success.banner')}</span>
            </div>
            <button className="result-close-button" onClick={onClearResult} type="button" aria-label={t('tokenSimpleControlCreation.actions.close')}>
              <CloseOutlined />
            </button>
          </div>
          <SimpleControlResultSummary model={model} />
        </div>
      ) : null}

      <OperationStatus
        cancelBtnShow={submitStep?.id === 1 || submitStep?.id === 2}
        onClose={onCancelFlow}
        open={Boolean(submitStep)}
        step={submitStep}
        steps={[
          { id: 1, text: t('tokenSimpleControlCreation.steps.preparing') },
          { id: 2, text: t('tokenSimpleControlCreation.steps.waitingWallet') },
          { id: 3, text: t('tokenSimpleControlCreation.steps.pending') },
          { id: 4, text: t('tokenSimpleControlCreation.steps.completed'), errorText: t('tokenSimpleControlCreation.steps.failed') },
        ]}
        title={t('tokenSimpleControlCreation.modal.progressTitle')}
      />

      <AppModal
        className="token-result-modal"
        footer={<Button type="primary" onClick={onCloseSuccessModal}>{t('tokenSimpleControlCreation.actions.close')}</Button>}
        onCancel={onCloseSuccessModal}
        open={successModalOpen}
        title={<div className="token-result-modal-heading">{t('tokenSimpleControlCreation.modal.successTitle')}</div>}
      >
        <div className="result-modal-shell">
          <div className="result-modal-card">
            <ResultModalRow copyLabel="copy token address" href={tokenExplorerUrl} label={t('tokenSimpleControlCreation.success.tokenAddress')} value={result?.tokenAddress} />
            <ResultModalRow copyLabel="copy tx hash" href={txExplorerUrl} label={t('tokenSimpleControlCreation.success.txHash')} value={result?.txHash} />
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
            <Button onClick={onCloseFailureModal}>{t('tokenSimpleControlCreation.actions.close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                onCloseFailureModal()
                void onSubmit()
              }}
            >
              {t('tokenSimpleControlCreation.actions.retry')}
            </Button>
          </>
        }
        labelText={t('common.exception.possibleReasons')}
        noteText={t('common.exception.contactOfficialSupport')}
        onClose={onCloseFailureModal}
        open={failureModalOpen}
        title={t('tokenSimpleControlCreation.modal.errorTitle')}
      />
    </section>
  )
}

function SimpleControlResultSummary({ model }: { model: TokenSimpleControlViewModel }) {
  const { t, chainDefinition, formValues, result } = model
  const items = [
    {
      key: 'tokenAddress',
      label: t('tokenSimpleControlCreation.successSummary.tokenAddress'),
      value: result?.tokenAddress,
      href: getExplorerUrl(chainDefinition, 'token', result?.tokenAddress),
      copyLabel: 'copy token address',
    },
    {
      key: 'txHash',
      label: t('tokenSimpleControlCreation.successSummary.txHash'),
      value: result?.txHash,
      href: getExplorerUrl(chainDefinition, 'hash', result?.txHash),
      copyLabel: 'copy tx hash',
    },
    {
      key: 'receiveAddress',
      label: t('tokenSimpleControlCreation.successSummary.receiveAddress'),
      value: result?.receiveAddress,
      href: getExplorerUrl(chainDefinition, 'address', result?.receiveAddress),
      copyLabel: 'copy receive address',
    },
    {
      key: 'permissions',
      label: t('tokenSimpleControlCreation.successSummary.permissions'),
      value: [
        formValues.enableMint ? t('tokenSimpleControlCreation.fields.enableMint') : '',
        formValues.enablePause ? t('tokenSimpleControlCreation.fields.enablePause') : '',
        formValues.blacklistEnabled ? t('tokenSimpleControlCreation.fields.blacklistEnabled') : '',
        formValues.enableWalletLimit ? t('tokenSimpleControlCreation.fields.enableWalletLimit') : '',
      ].filter(Boolean).join(' / ') || t('tokenSimpleControlCreation.successSummary.basicTransfer'),
    },
  ]

  return (
    <section className="token-success-section">
      <div className="summary-detail-list">
        {items.map((item) => (
          <div className="summary-detail-card" key={item.key}>
            <span>{item.label}</span>
            {item.value ? (
              <div className="result-inline-value">
                {item.href ? (
                  <a className="value-link" href={item.href} target="_blank" rel="noreferrer">
                    {formatText(item.value)}
                  </a>
                ) : (
                  <strong>{item.value}</strong>
                )}
                {item.key !== 'permissions' ? <CopyButton ariaLabel={item.copyLabel ?? 'copy value'} value={item.value} /> : null}
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

function ResultModalRow({
  copyLabel,
  href,
  label,
  value,
}: {
  copyLabel: string
  href: string
  label: string
  value?: string
}) {
  return (
    <div className="result-modal-row">
      <span>{label}</span>
      <div className="result-modal-value">
        {value ? (
          <a className="value-link" href={href} target="_blank" rel="noreferrer">
            {formatText(value)}
          </a>
        ) : (
          <strong>--</strong>
        )}
        {value ? <CopyButton ariaLabel={copyLabel} value={value} /> : null}
      </div>
    </div>
  )
}
