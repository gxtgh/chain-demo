import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber } from 'antd'
import { CopyButton } from '@/components/common/copy-button'
import { getExplorerUrl } from '@/config/chains'
import { AppModal } from '@/components/common/modal'
import { formatEther } from 'ethers'
import { OperationStatus } from '@/components/common/operation-status'
import { OperationWarning } from '@/components/common/operation-warning'
import type { TokenCreationViewModel } from '../business/model'
import { formatText } from '@/utils'
import { FieldLabelWithTooltip } from './field-label-with-tooltip'
import { TokenCreationSummary } from './token-creation-summary'

export function TokenCreationFormPanel({ model }: { model: TokenCreationViewModel }) {
  const {
    t,
    chainDefinition,
    formValues,
    errors,
    updateField,
    creationFee,
    feeLoading,
    loading,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    onSubmit,
    onCancelFlow,
    onCloseSuccessModal,
    onCloseFailureModal,
    onClearResult,
  } = model
  const txExplorerUrl = getExplorerUrl(chainDefinition, 'hash', result?.txHash)
  const tokenExplorerUrl = getExplorerUrl(chainDefinition, 'token', result?.tokenAddress)

  return (
    <section className="surface-card form-card">
      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenCreation.fields.name')} tooltip={t('tokenCreation.tooltips.name')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenCreation.placeholders.name')}
            value={formValues.name}
            maxLength={100}
            allowClear
            onChange={(event) => updateField('name', event.target.value)}
            status={errors.name ? 'error' : undefined}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenCreation.fields.symbol')} tooltip={t('tokenCreation.tooltips.symbol')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenCreation.placeholders.symbol')}
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
            label={t('tokenCreation.fields.totalSupply')}
            tooltip={t('tokenCreation.tooltips.totalSupply')}
          />
          <InputNumber
            className="token-form-number"
            style={{ width: '100%' }}
            placeholder={t('tokenCreation.placeholders.totalSupply')}
            value={formValues.totalSupply}
            controls={false}
            precision={0}
            stringMode
            parser={(value) => value?.replace(/[^\d]/g, '') || ''}
            onChange={(value) => updateField('totalSupply', String(value ?? ''))}
            status={errors.totalSupply ? 'error' : undefined}
          />
          {errors.totalSupply ? <small className="field-error">{errors.totalSupply}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenCreation.fields.decimals')} tooltip={t('tokenCreation.tooltips.decimals')} />
          <InputNumber
            className="token-form-number"
            min={0}
            max={18}
            value={formValues.decimals}
            controls={false}
            placeholder={t('tokenCreation.placeholders.decimals')}
            onChange={(value) => updateField('decimals', value == null ? null : Number(value))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>
      </div>

      <Button
        block
        className="primary-button ant-primary-button"
        loading={loading}
        onClick={() => void onSubmit()}
        type="primary"
        size="large"
      >
        {loading ? t('tokenCreation.actions.submitting') : t('tokenCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note fee-inline-note-after-submit">
        <FieldLabelWithTooltip
          label={t('tokenCreation.labels.creationFee')}
          tooltip={t('tokenCreation.tooltips.creationFee')}
        />
        <strong>
          {feeLoading || creationFee == null ? '...' : `${formatEther(creationFee)} ${chainDefinition.nativeToken.symbol}`}
        </strong>
      </div>

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-card-head">
            <div className="success-banner">
              <CheckCircleFilled />
              <span>{t('tokenCreation.success.banner')}</span>
            </div>
            <button className="result-close-button" onClick={onClearResult} type="button" aria-label={t('tokenCreation.actions.close')}>
              <CloseOutlined />
            </button>
          </div>
          <TokenCreationSummary chainDefinition={chainDefinition} result={result} t={t} />
        </div>
      ) : null}

      <OperationStatus
        open={Boolean(submitStep)}
        title={t('tokenCreation.modal.progressTitle')}
        step={submitStep}
        steps={[
          { id: 1, text: t('tokenCreation.steps.preparing') },
          { id: 2, text: t('tokenCreation.steps.waitingWallet') },
          { id: 3, text: t('tokenCreation.steps.pending') },
          {
            id: 4,
            text: t('tokenCreation.steps.completed'),
            errorText: t('tokenCreation.steps.failed'),
          },
        ]}
        // tipsText={t('tokenCreation.modal.progressTip')}
        cancelBtnShow={false}
        onClose={onCancelFlow}
      />

      <AppModal
        open={successModalOpen}
        footer={<Button type="primary" onClick={onCloseSuccessModal}>{t('tokenCreation.actions.close')}</Button>}
        onCancel={onCloseSuccessModal}
        className="token-result-modal"
        title={<div className="token-result-modal-heading">{t('tokenCreation.modal.successTitle')}</div>}
      >
        <div className="result-modal-shell">
          <div className="result-modal-card">
            <div className="result-modal-row">
              <span>{t('tokenCreation.success.tokenAddress')}</span>
              <div className="result-modal-value">
                {result?.tokenAddress ? (
                  <a className="value-link" href={tokenExplorerUrl} target="_blank" rel="noreferrer">
                    {formatText(result.tokenAddress)}
                  </a>
                ) : (
                  <strong>--</strong>
                )}
                {result?.tokenAddress ? (
                  <CopyButton ariaLabel="copy token address" value={result.tokenAddress} />
                ) : null}
              </div>
            </div>
            <div className="result-modal-row">
              <span>{t('tokenCreation.success.txHash')}</span>
              <div className="result-modal-value">
                {result?.txHash ? (
                  <a className="value-link" href={txExplorerUrl} target="_blank" rel="noreferrer">
                    {formatText(result.txHash)}
                  </a>
                ) : (
                  <strong>--</strong>
                )}
                {result?.txHash ? (
                  <CopyButton ariaLabel="copy tx hash" value={result.txHash} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </AppModal>
      <OperationWarning
        open={failureModalOpen}
        title={t('tokenCreation.modal.errorTitle')}
        labelText={t('common.exception.possibleReasons')}
        contents={[
          t('common.exception.errorReason1', { chain: chainDefinition.fullName }),
          t('common.exception.errorReason2'),
        ]}
        noteText={t('common.exception.contactOfficialSupport')}
        footer={
          <>
            <Button onClick={onCloseFailureModal}>{t('tokenCreation.actions.close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                onCloseFailureModal()
                void onSubmit()
              }}
            >
              {t('tokenCreation.actions.retry')}
            </Button>
          </>
        }
        onClose={onCloseFailureModal}
      />
    </section>
  )
}
