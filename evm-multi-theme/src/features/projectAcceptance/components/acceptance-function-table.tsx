import type { AcceptanceFunction } from '../config/acceptance-types'

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
