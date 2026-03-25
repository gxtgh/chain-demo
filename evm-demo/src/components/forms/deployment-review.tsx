import { useMemo } from 'react'

type DeploymentReviewProps<T extends Record<string, string | boolean>> = {
  title: string
  chainLabel: string
  fields: T
  requiredFields: Array<keyof T>
  invalidFields?: Array<keyof T>
  fieldLabels?: Partial<Record<keyof T, string>>
  confirmChecked: boolean
  onConfirmChecked: (value: boolean) => void
  confirmLabel: string
  walletReady: boolean
  walletError: string
  onPrepare: () => void
  submitLabel: string
  readyLabel: string
  notReadyLabel: string
  walletNotConnectedLabel: string
  missingLabel: string
  invalidLabel: string
}

export function DeploymentReview<T extends Record<string, string | boolean>>({
  title,
  chainLabel,
  fields,
  requiredFields,
  invalidFields = [],
  fieldLabels,
  confirmChecked,
  onConfirmChecked,
  confirmLabel,
  walletReady,
  walletError,
  onPrepare,
  submitLabel,
  readyLabel,
  notReadyLabel,
  walletNotConnectedLabel,
  missingLabel,
  invalidLabel,
}: DeploymentReviewProps<T>) {
  const missingFields = useMemo(
    () =>
      requiredFields.filter((field) => {
        const value = fields[field]
        return value === '' || value === false
      }),
    [fields, requiredFields],
  )

  const canProceed = missingFields.length === 0 && invalidFields.length === 0

  return (
    <section className="review-card">
      <div className="panel-label">{title}</div>
      <div className="review-summary">
        <span>{chainLabel}</span>
        <strong>{canProceed ? readyLabel : notReadyLabel}</strong>
      </div>

      <div className="summary-grid">
        {Object.entries(fields).map(([key, value]) => (
          <div className="summary-item" key={key}>
            <span>{fieldLabels?.[key as keyof T] ?? key}</span>
            <strong>{String(value || '--')}</strong>
          </div>
        ))}
      </div>

      {!walletReady ? <div className="warning-box">{walletError || walletNotConnectedLabel}</div> : null}
      {missingFields.length ? (
        <div className="warning-box">
          {`${missingLabel}: ${missingFields
            .map((field) => fieldLabels?.[field] ?? String(field))
            .join(', ')}`}
        </div>
      ) : null}
      {invalidFields.length ? (
        <div className="warning-box">
          {`${invalidLabel}: ${invalidFields
            .map((field) => fieldLabels?.[field] ?? String(field))
            .join(', ')}`}
        </div>
      ) : null}

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={confirmChecked}
          onChange={(event) => onConfirmChecked(event.target.checked)}
        />
        <span>{confirmLabel}</span>
      </label>

      <button
        className="primary-button"
        type="button"
        disabled={!walletReady || !canProceed || !confirmChecked}
        onClick={onPrepare}
      >
        {submitLabel}
      </button>
    </section>
  )
}
