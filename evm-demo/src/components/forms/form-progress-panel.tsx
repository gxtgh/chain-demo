import { useState } from 'react'
import type { FormIssue, FormProgress } from '../../utils/form-progress'

type FormProgressPanelProps = {
  title: string
  subtitle: string
  progress: FormProgress
  completionLabel: string
  requiredStatusLabel: string
  missingTitle: string
  invalidTitle: string
  recommendationTitle: string
  allGoodLabel: string
  expandLabel: string
  collapseLabel: string
}

export function FormProgressPanel({
  title,
  subtitle,
  progress,
  completionLabel,
  requiredStatusLabel,
  missingTitle,
  invalidTitle,
  recommendationTitle,
  allGoodLabel,
  expandLabel,
  collapseLabel,
}: FormProgressPanelProps) {
  const [isMissingExpanded, setIsMissingExpanded] = useState(false)
  const hasIssues =
    progress.missingRequired.length > 0 ||
    progress.invalidFields.length > 0 ||
    progress.recommendations.length > 0

  return (
    <section className="progress-card">
      <div className="progress-head">
        <div>
          <p className="panel-label">{title}</p>
          <p className="panel-copy">{subtitle}</p>
        </div>
        <div className="progress-badge">{progress.completionPercent}%</div>
      </div>

      <div className="progress-bar" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress.completionPercent}%` }} />
      </div>

      <div className="progress-metrics">
        <div className="metric-card">
          <span>{completionLabel}</span>
          <strong>{`${progress.completedCount}/${progress.totalCount}`}</strong>
        </div>
        <div className="metric-card">
          <span>{requiredStatusLabel}</span>
          <strong>{`${progress.requiredCompleted}/${progress.requiredTotal}`}</strong>
        </div>
      </div>

      {hasIssues ? (
        <div className="progress-sections">
          <IssueList
            title={missingTitle}
            issues={progress.missingRequired}
            collapsible
            expanded={isMissingExpanded}
            onToggle={() => setIsMissingExpanded((current) => !current)}
            expandLabel={expandLabel}
            collapseLabel={collapseLabel}
          />
          <IssueList title={invalidTitle} issues={progress.invalidFields} />
          <IssueList title={recommendationTitle} issues={progress.recommendations} />
        </div>
      ) : (
        <div className="success-box">{allGoodLabel}</div>
      )}
    </section>
  )
}

function IssueList({
  title,
  issues,
  collapsible = false,
  expanded = true,
  onToggle,
  expandLabel,
  collapseLabel,
}: {
  title: string
  issues: FormIssue[]
  collapsible?: boolean
  expanded?: boolean
  onToggle?: () => void
  expandLabel?: string
  collapseLabel?: string
}) {
  if (issues.length === 0) {
    return null
  }

  return (
    <div className="result-block">
      <div className="issue-head">
        <p className="panel-label">{title}</p>
        {collapsible ? (
          <button className="text-button" type="button" onClick={onToggle}>
            {expanded ? collapseLabel : expandLabel}
          </button>
        ) : null}
      </div>
      {expanded ? (
        <div className="issue-list">
          {issues.map((issue) => (
            <div className="issue-item" key={`${issue.field}-${issue.message}`}>
              <strong>{issue.label}</strong>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
