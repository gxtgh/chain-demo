import type { AcceptanceRisk } from '../config/acceptance-types'

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
