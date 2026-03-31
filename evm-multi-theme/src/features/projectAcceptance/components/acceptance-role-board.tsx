import type { AcceptanceRoleProgress } from '../config/acceptance-types'

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
