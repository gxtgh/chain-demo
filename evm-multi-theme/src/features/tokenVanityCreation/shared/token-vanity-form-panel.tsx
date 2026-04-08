import { CheckCircleFilled, CloseOutlined, InfoCircleFilled, PauseOutlined } from '@ant-design/icons'
import { Alert, Button, Input, InputNumber, Progress } from 'antd'
import { AppModal } from '@/components/common/modal'
import { OperationStatus } from '@/components/common/operation-status'
import { OperationWarning } from '@/components/common/operation-warning'
import { CopyButton } from '@/components/common/copy-button'
import { getExplorerUrl } from '@/config/chains'
import { formatNativeAmount, formatText } from '@/utils'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import type { TokenVanityViewModel } from '../business/model'
import { TokenVanitySummary } from './token-vanity-summary'

const PREVIEW_ADDRESS = 'eed0735b07dde76d13f11d9c5e796ce7d73b4444'

export function TokenVanityFormPanel({ model }: { model: TokenVanityViewModel }) {
  const {
    t,
    chainDefinition,
    formValues,
    errors,
    updateField,
    creationFee,
    feeLoading,
    creationCodeLoading,
    factoryAvailable,
    resourceError,
    loading,
    search,
    submitStep,
    result,
    successModalOpen,
    failureModalOpen,
    onStartGenerate,
    onStopGenerate,
    onSubmit,
    onCancelFlow,
    onCloseSuccessModal,
    onCloseFailureModal,
    onClearResult,
  } = model

  const tokenExplorerUrl = getExplorerUrl(chainDefinition, 'token', result?.tokenAddress ?? result?.predictedAddress)
  const txExplorerUrl = getExplorerUrl(chainDefinition, 'hash', result?.txHash)
  const vanityAddressExplorerUrl = getExplorerUrl(chainDefinition, 'address', search.match?.address)

  return (
    <section className="surface-card form-card vanity-form-card">
      {!factoryAvailable && !creationCodeLoading ? (
        <Alert title={resourceError ?? t('tokenVanityCreation.status.factoryUnavailable')} type="warning" showIcon />
      ) : null}

      <div className="field-grid">
        <label className="field">
          <FieldLabelWithTooltip label={t('tokenVanityCreation.fields.name')} tooltip={t('tokenCreation.tooltips.name')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenVanityCreation.placeholders.name')}
            value={formValues.name}
            maxLength={100}
            allowClear
            onChange={(event) => updateField('name', event.target.value)}
            status={errors.name ? 'error' : undefined}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>

        <label className="field">
          <FieldLabelWithTooltip label={t('tokenVanityCreation.fields.symbol')} tooltip={t('tokenCreation.tooltips.symbol')} />
          <Input
            className="token-form-input"
            placeholder={t('tokenVanityCreation.placeholders.symbol')}
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
            label={t('tokenVanityCreation.fields.totalSupply')}
            tooltip={t('tokenCreation.tooltips.totalSupply')}
          />
          <InputNumber
            className="token-form-number"
            style={{ width: '100%' }}
            placeholder={t('tokenVanityCreation.placeholders.totalSupply')}
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
          <FieldLabelWithTooltip label={t('tokenVanityCreation.fields.decimals')} tooltip={t('tokenCreation.tooltips.decimals')} />
          <InputNumber
            className="token-form-number"
            min={0}
            max={18}
            style={{ width: '100%' }}
            value={formValues.decimals}
            controls={false}
            placeholder={t('tokenVanityCreation.placeholders.decimals')}
            onChange={(value) => updateField('decimals', value == null ? null : Number(value))}
            status={errors.decimals ? 'error' : undefined}
          />
          {errors.decimals ? <small className="field-error">{errors.decimals}</small> : null}
        </label>

      </div>

      <section className="vanity-generator-panel">
        <div className="vanity-generator-head">
          <div>
            <strong>{t('tokenVanityCreation.labels.generation')}</strong>
            <p>
              {t('tokenVanityCreation.labels.generationDescription', {
                chainFullName: chainDefinition.fullName,
                chainName: chainDefinition.name,
              })}
            </p>
          </div>
        </div>

        <div className="vanity-input-row">
          <label className="field">
            <FieldLabelWithTooltip label={t('tokenVanityCreation.fields.prefix')} tooltip={t('tokenVanityCreation.tooltips.prefix')} />
            <div className={`vanity-prefix-shell ${errors.prefix ? 'error' : ''}`}>
              <span className="vanity-prefix-tag">0x</span>
              <Input
                className="token-form-input"
                placeholder={t('tokenVanityCreation.placeholders.prefix')}
                value={formValues.prefix}
                allowClear
                onChange={(event) => updateField('prefix', event.target.value.toLowerCase())}
                status={errors.prefix ? 'error' : undefined}
              />
            </div>
            {errors.prefix ? <small className="field-error">{errors.prefix}</small> : null}
          </label>

          <label className="field">
            <FieldLabelWithTooltip label={t('tokenVanityCreation.fields.suffix')} tooltip={t('tokenVanityCreation.tooltips.suffix')} />
            <Input
              className="token-form-input"
              placeholder={t('tokenVanityCreation.placeholders.suffix')}
              value={formValues.suffix}
              allowClear
              onChange={(event) => updateField('suffix', event.target.value.toLowerCase())}
              status={errors.suffix ? 'error' : undefined}
            />
            {errors.suffix ? <small className="field-error">{errors.suffix}</small> : null}
          </label>
        </div>

        <div className="vanity-preview-card">
          <span>{t('tokenVanityCreation.labels.preview')}</span>
          <div className="vanity-preview-address">
            <span className="preview-prefix">0x</span>
            <span className="preview-body">
              {renderPreview(PREVIEW_ADDRESS, formValues.prefix.trim().toLowerCase(), formValues.suffix.trim().toLowerCase())}
            </span>
          </div>
        </div>

        <div className="vanity-generator-actions">
          <Button className="vanity-stop-button" onClick={onStopGenerate} disabled={search.status !== 'searching'}>
            <PauseOutlined />
            {t('tokenVanityCreation.actions.stop')}
          </Button>
          <Button
            className="primary-button ant-primary-button"
            type="primary"
            loading={search.status === 'searching' || creationCodeLoading}
            disabled={!factoryAvailable}
            onClick={() => void onStartGenerate()}
          >
            {search.match ? t('tokenVanityCreation.actions.regenerate') : t('tokenVanityCreation.actions.generate')}
          </Button>
        </div>

        <div className="vanity-status-grid">
          <article className="summary-stat-card">
            <span>{t('tokenVanityCreation.labels.difficulty')}</span>
            <strong>{formatDifficulty(search.difficulty)}</strong>
          </article>
          <article className="summary-stat-card">
            <span>{t('tokenVanityCreation.labels.generated')}</span>
            <strong>{formatNumber(search.generatedCount)}</strong>
          </article>
          <article className="summary-stat-card">
            <span>{t('tokenVanityCreation.labels.estimated')}</span>
            <strong>{formatDuration(search.estimatedSeconds)}</strong>
          </article>
          <article className="summary-stat-card">
            <span>{t('tokenVanityCreation.labels.speed')}</span>
            <strong>{`${formatNumber(search.speed)}/s`}</strong>
          </article>
          <article className="summary-stat-card">
            <span>{t('tokenVanityCreation.labels.status')}</span>
            <strong>{getSearchStatusText(search.status, t)}</strong>
          </article>
        </div>

        <div className="vanity-progress-row">
          <Progress
            percent={search.progress}
            showInfo
            strokeColor="var(--theme-accent)"
            format={(percent) => `${Math.round(percent ?? 0)}%`}
          />
        </div>

        {search.match ? (
          <div className="vanity-match-card">
            <div className="summary-detail-list">
              <div className="summary-detail-card">
                <span>{t('tokenVanityCreation.labels.predictedAddress')}</span>
                <div className="result-inline-value">
                  <a className="value-link" href={vanityAddressExplorerUrl} target="_blank" rel="noreferrer">
                    {formatText(search.match.address)}
                  </a>
                  <CopyButton ariaLabel="copy vanity address" value={search.match.address} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="vanity-empty-state" role="status" aria-live="polite">
            <span className="vanity-empty-state-icon" aria-hidden="true">
              <InfoCircleFilled />
            </span>
            <span>{t('tokenVanityCreation.status.noMatch')}</span>
          </div>
        )}
      </section>

      <Button
        block
        className="primary-button ant-primary-button"
        loading={loading}
        onClick={() => void onSubmit()}
        type="primary"
        size="large"
        disabled={!factoryAvailable}
      >
        {loading ? t('tokenVanityCreation.actions.submitting') : t('tokenVanityCreation.actions.submit')}
      </Button>

      <div className="fee-inline-note fee-inline-note-after-submit">
        <FieldLabelWithTooltip
          label={t('tokenVanityCreation.labels.creationFee')}
          tooltip={t('tokenVanityCreation.tooltips.creationFee')}
        />
        <strong>{feeLoading || creationFee == null ? '...' : `${formatNativeAmount(creationFee)} ${chainDefinition.nativeToken.symbol}`}</strong>
      </div>

      {result ? (
        <div className="result-card success-result-card">
          <div className="success-card-head">
            <div className="success-banner">
              <CheckCircleFilled />
              <span>{t('tokenVanityCreation.success.banner')}</span>
            </div>
            <button className="result-close-button" onClick={onClearResult} type="button" aria-label={t('tokenVanityCreation.actions.close')}>
              <CloseOutlined />
            </button>
          </div>
          <TokenVanitySummary chainDefinition={chainDefinition} result={result} t={t} />
        </div>
      ) : null}

      <OperationStatus
        open={Boolean(submitStep)}
        title={t('tokenVanityCreation.modal.progressTitle')}
        step={submitStep}
        steps={[
          { id: 1, text: t('tokenVanityCreation.steps.preparing') },
          { id: 2, text: t('tokenVanityCreation.steps.waitingWallet') },
          { id: 3, text: t('tokenVanityCreation.steps.pending') },
          { id: 4, text: t('tokenVanityCreation.steps.completed'), errorText: t('tokenVanityCreation.steps.failed') },
        ]}
        cancelBtnShow={submitStep?.id === 1 || submitStep?.id === 2}
        onClose={onCancelFlow}
      />

      <AppModal
        open={successModalOpen}
        footer={<Button type="primary" onClick={onCloseSuccessModal}>{t('tokenVanityCreation.actions.close')}</Button>}
        onCancel={onCloseSuccessModal}
        className="token-result-modal"
        title={<div className="token-result-modal-heading">{t('tokenVanityCreation.modal.successTitle')}</div>}
      >
        <div className="result-modal-shell">
          <div className="result-modal-card">
            <div className="result-modal-row">
              <span>{t('tokenVanityCreation.success.tokenAddress')}</span>
              <div className="result-modal-value">
                {result?.tokenAddress ? (
                  <>
                    <a className="value-link" href={tokenExplorerUrl} target="_blank" rel="noreferrer">
                      {formatText(result.tokenAddress)}
                    </a>
                    <CopyButton ariaLabel="copy token address" value={result.tokenAddress} />
                  </>
                ) : (
                  <strong>--</strong>
                )}
              </div>
            </div>
            <div className="result-modal-row">
              <span>{t('tokenVanityCreation.success.txHash')}</span>
              <div className="result-modal-value">
                {result?.txHash ? (
                  <>
                    <a className="value-link" href={txExplorerUrl} target="_blank" rel="noreferrer">
                      {formatText(result.txHash)}
                    </a>
                    <CopyButton ariaLabel="copy tx hash" value={result.txHash} />
                  </>
                ) : (
                  <strong>--</strong>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppModal>

      <OperationWarning
        open={failureModalOpen}
        title={t('tokenVanityCreation.modal.errorTitle')}
        labelText={t('common.exception.possibleReasons')}
        contents={[
          t('common.exception.errorReason1', { chain: chainDefinition.fullName }),
          t('common.exception.errorReason2'),
        ]}
        noteText={t('common.exception.contactOfficialSupport')}
        footer={
          <>
            <Button onClick={onCloseFailureModal}>{t('tokenVanityCreation.actions.close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                onCloseFailureModal()
                void onSubmit()
              }}
            >
              {t('tokenVanityCreation.actions.retry')}
            </Button>
          </>
        }
        onClose={onCloseFailureModal}
      />
    </section>
  )
}

function renderPreview(baseAddress: string, prefix: string, suffix: string) {
  const normalizedPrefix = prefix.slice(0, 40)
  const normalizedSuffix = suffix.slice(0, Math.max(0, 40 - normalizedPrefix.length))
  const middleStart = normalizedPrefix.length
  const middleEnd = baseAddress.length - normalizedSuffix.length
  const middle = baseAddress.slice(middleStart, middleEnd)

  return (
    <>
      {normalizedPrefix ? <span className="preview-hit">{normalizedPrefix}</span> : null}
      <span>{middle}</span>
      {normalizedSuffix ? <span className="preview-hit">{normalizedSuffix}</span> : null}
    </>
  )
}

function getSearchStatusText(
  status: TokenVanityViewModel['search']['status'],
  t: TokenVanityViewModel['t'],
) {
  if (status === 'searching') return t('tokenVanityCreation.status.searching')
  if (status === 'success') return t('tokenVanityCreation.status.success')
  if (status === 'stopped') return t('tokenVanityCreation.status.stopped')
  return t('tokenVanityCreation.status.idle')
}

function formatDifficulty(value: bigint) {
  const digits = value.toString()
  if (digits.length <= 15) {
    return formatNumber(Number(digits))
  }

  return `${digits.slice(0, 4)}e+${digits.length - 1}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds == null) {
    return '--'
  }

  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (hours === 0 && seconds > 0) parts.push(`${seconds}s`)
  return parts.join(' ')
}
