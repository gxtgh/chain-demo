import { PageHeader } from '@/components/common/page-header'
import type { AcceptanceFunction, AcceptanceRisk, AcceptanceRoleProgress, AcceptanceTask } from '../config/acceptance-data'

export function AcceptanceHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="acceptance-hero">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
    </div>
  )
}

export function AcceptanceSummaryCards({
  rows,
}: {
  rows: Array<{ label: string; value: string | number }>
}) {
  return (
    <section className="summary-grid summary-grid-four">
      {rows.map((row) => (
        <article className="surface-card summary-card" key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </article>
      ))}
    </section>
  )
}

export function AcceptanceFunctionTable({
  items,
  title,
  openLabel,
}: {
  items: AcceptanceFunction[]
  title: string
  openLabel: string
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="acceptance-table">
        {items.map((item) => (
          <div className="acceptance-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
            <div>
              <span>{item.currentStage}</span>
              <strong>{item.completion}%</strong>
            </div>
            <div>
              <span>{item.themes.join(' / ')}</span>
              <a className="text-link" href={item.route}>
                {openLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AcceptanceRoleBoard({
  rows,
  title,
  roleLabel,
  statusLabel,
  ownerLabel,
  updatedLabel,
  translateRole,
  translateStatus,
}: {
  rows: AcceptanceRoleProgress[]
  title: string
  roleLabel: string
  statusLabel: string
  ownerLabel: string
  updatedLabel: string
  translateRole: (role: AcceptanceRoleProgress['role']) => string
  translateStatus: (status: AcceptanceRoleProgress['status']) => string
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="role-grid">
        {rows.map((row) => (
          <article className="role-card" key={row.role}>
            <div className="role-card-top">
              <strong>{translateRole(row.role)}</strong>
              <span>{row.completion}%</span>
            </div>
            <div className="role-meta">
              <span>{roleLabel}</span>
              <strong>{translateRole(row.role)}</strong>
            </div>
            <div className="role-meta">
              <span>{statusLabel}</span>
              <strong>{translateStatus(row.status)}</strong>
            </div>
            <div className="role-meta">
              <span>{ownerLabel}</span>
              <strong>{row.owner}</strong>
            </div>
            <div className="role-meta">
              <span>{updatedLabel}</span>
              <strong>{row.updatedAt}</strong>
            </div>
            <p>{row.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function AcceptanceTaskList({
  tasks,
  title,
  labels,
  translateRole,
  translateStatus,
  translatePriority,
}: {
  tasks: AcceptanceTask[]
  title: string
  labels: {
    role: string
    status: string
    priority: string
    blocked: string
    note: string
  }
  translateRole: (role: AcceptanceTask['role']) => string
  translateStatus: (status: AcceptanceTask['status']) => string
  translatePriority: (priority: AcceptanceTask['priority']) => string
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="task-list">
        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card-top">
              <strong>{task.title}</strong>
              <span>{translateStatus(task.status)}</span>
            </div>
            <div className="task-meta-grid">
              <div>
                <span>{labels.role}</span>
                <strong>{translateRole(task.role)}</strong>
              </div>
              <div>
                <span>{labels.priority}</span>
                <strong>{translatePriority(task.priority)}</strong>
              </div>
              <div>
                <span>{labels.blocked}</span>
                <strong>{task.blocked ? 'Yes' : 'No'}</strong>
              </div>
            </div>
            <p>{task.note}</p>
            {task.link ? (
              <a className="text-link" href={task.link}>
                {task.link}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export function AcceptanceRiskPanel({
  items,
  title,
}: {
  items: AcceptanceRisk[]
  title: string
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="risk-list">
        {items.map((item) => (
          <article className={`risk-card ${item.level}`} key={item.title}>
            <div className="risk-head">
              <strong>{item.title}</strong>
              <span>{item.level.toUpperCase()}</span>
            </div>
            <p>{item.summary}</p>
            <small>{item.action}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

export function AcceptanceLinksPanel({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="links-list">
        {links.map((link) => (
          <a className="link-card" href={link.href} key={link.href}>
            <span>{link.label}</span>
            <strong>{link.href}</strong>
          </a>
        ))}
      </div>
    </section>
  )
}
