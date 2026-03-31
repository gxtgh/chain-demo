import { CheckCircleFilled, CopyOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber, Modal, Result, Steps } from 'antd'
import { formatEther } from 'ethers'
import { useMemo, useState } from 'react'
import type { TokenCreationViewModel } from '../business/types'

export function TokenCreationFormPanel({ model }: { model: TokenCreationViewModel }) {
  const {
    t,
    chainDefinition,
    formValues,
    errors,
    updateField,
    creationFee,
    feeLoading,
    attemptCount,
    submitPhase,
    submitError,
    result,
    onSubmit,
    resetSubmitState,
    hasSubmitted,
  } = model
  const [closedSuccessAttempt, setClosedSuccessAttempt] = useState<number | null>(null)
  const [closedFailureAttempt, setClosedFailureAttempt] = useState<number | null>(null)

  const statusMessage =
    submitPhase === 'loading_fee'
      ? t('tokenCreation.status.loadingFee')
      : submitPhase === 'preparing'
        ? t('tokenCreation.status.preparing')
      : submitPhase === 'waiting_wallet'
        ? t('tokenCreation.status.waitingWallet')
        : submitPhase === 'pending'
          ? t('tokenCreation.status.pending')
          : submitPhase === 'success'
            ? t('tokenCreation.status.success')
            : ''

  const progressStep = useMemo(() => {
    if (submitPhase === 'preparing') return 0
    if (submitPhase === 'waiting_wallet') return 1
    if (submitPhase === 'pending') return 2
    return 3
  }, [submitPhase])

  const stepItems = useMemo(
    () => [
      { title: t('tokenCreation.steps.preparing') },
      { title: t('tokenCreation.steps.waitingWallet') },
      { title: t('tokenCreation.steps.pending') },
      { title: t('tokenCreation.steps.completed') },
    ],
    [t],
  )

  const progressOpen = submitPhase === 'preparing' || submitPhase === 'waiting_wallet' || submitPhase === 'pending'
  const successOpen = submitPhase === 'success' && Boolean(result) && closedSuccessAttempt !== attemptCount
  const failureOpen = submitPhase === 'error' && Boolean(submitError) && attemptCount > 0 && closedFailureAttempt !== attemptCount

  async function handleCopy(value: string | undefined) {
    if (!value || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Ignore clipboard failures in unsupported environments.
    }
  }

  return (
    <section className="surface-card form-card">
      <div className="field-grid">
        <label className="field">
          <span>{t('tokenCreation.fields.name')}</span>
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
          <span>{t('tokenCreation.fields.symbol')}</span>
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
          <span>{t('tokenCreation.fields.totalSupply')}</span>
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
          <span>{t('tokenCreation.fields.decimals')}</span>
          <InputNumber
            className="token-form-number"
            min={0}
            max={18}
            value={formValues.decimals}
            controls={false}
            placeholder={t('tokenCreation.placeholders.decimals')}
            onChange={(value) => updateField('decimals', Number(value ?? 18))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>
      </div>

      <Button
        block
        className="primary-button ant-primary-button"
        loading={submitPhase === 'waiting_wallet' || submitPhase === 'pending'}
        onClick={() => void onSubmit()}
        type="primary"
        size="large"
      >
        {submitPhase === 'waiting_wallet' || submitPhase === 'pending'
          ? t('tokenCreation.actions.submitting')
          : t('tokenCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note">
        <span>{t('tokenCreation.labels.creationFee')}</span>
        <strong>
          {feeLoading || creationFee == null ? '...' : `${formatEther(creationFee)} ${chainDefinition.nativeSymbol}`}
        </strong>
      </div>

      {hasSubmitted && submitPhase === 'error' && submitError ? (
        <div className={`state-banner ${submitPhase}`}>{submitError || statusMessage}</div>
      ) : null}

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-banner">
            <CheckCircleFilled />
            <span>{t('tokenCreation.success.banner')}</span>
          </div>
          <div className="summary-list compact">
            <div className="summary-row">
              <span>{t('tokenCreation.success.txHash')}</span>
              <strong>{result.txHash}</strong>
            </div>
            <div className="summary-row">
              <span>{t('tokenCreation.success.tokenAddress')}</span>
              <strong>{result.tokenAddress ?? '--'}</strong>
            </div>
          </div>
          <a className="text-link" href={result.explorerUrl} target="_blank" rel="noreferrer">
            {t('tokenCreation.success.openExplorer')}
          </a>
        </div>
      ) : null}

      <Modal
        open={progressOpen}
        footer={null}
        closable={false}
        centered
        className="token-progress-modal"
        title={t('tokenCreation.modal.progressTitle')}
      >
        <div className="token-progress-body">
          <Steps
            direction="vertical"
            current={progressStep}
            items={stepItems}
            status={submitPhase === 'error' ? 'error' : undefined}
          />
          <div className={`progress-inline-tip ${submitPhase}`}>{statusMessage}</div>
        </div>
      </Modal>

      <Modal
        open={successOpen}
        footer={null}
        onCancel={() => setClosedSuccessAttempt(attemptCount)}
        centered
        className="token-result-modal"
      >
        <Result
          status="success"
          title={t('tokenCreation.modal.successTitle')}
          subTitle={t('tokenCreation.status.success')}
          extra={
            <div className="result-actions">
              <Button onClick={() => setClosedSuccessAttempt(attemptCount)}>{t('tokenCreation.actions.close')}</Button>
              <Button href={result?.explorerUrl} target="_blank" rel="noreferrer" type="primary">
                {t('tokenCreation.success.openExplorer')}
              </Button>
            </div>
          }
        />
        <div className="result-modal-card">
          <div className="result-modal-row">
            <span>{t('tokenCreation.success.tokenAddress')}</span>
            <div className="result-modal-value">
              <strong>{result?.tokenAddress ?? '--'}</strong>
              {result?.tokenAddress ? (
                <button type="button" onClick={() => void handleCopy(result.tokenAddress)} aria-label="copy token address">
                  <CopyOutlined />
                </button>
              ) : null}
            </div>
          </div>
          <div className="result-modal-row">
            <span>{t('tokenCreation.success.txHash')}</span>
            <div className="result-modal-value">
              <strong>{result?.txHash ?? '--'}</strong>
              {result?.txHash ? (
                <button type="button" onClick={() => void handleCopy(result.txHash)} aria-label="copy tx hash">
                  <CopyOutlined />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={failureOpen}
        footer={null}
        onCancel={() => {
          setClosedFailureAttempt(attemptCount)
          resetSubmitState()
        }}
        centered
        className="token-result-modal"
      >
        <Result
          status="error"
          title={t('tokenCreation.modal.errorTitle')}
          subTitle={submitError || t('tokenCreation.modal.errorDescription')}
          extra={
            <div className="result-actions">
              <Button
                onClick={() => {
                  setClosedFailureAttempt(attemptCount)
                  resetSubmitState()
                }}
              >
                {t('tokenCreation.actions.close')}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setClosedFailureAttempt(attemptCount)
                  resetSubmitState()
                }}
              >
                {t('tokenCreation.actions.retry')}
              </Button>
            </div>
          }
        />
      </Modal>
    </section>
  )
}
