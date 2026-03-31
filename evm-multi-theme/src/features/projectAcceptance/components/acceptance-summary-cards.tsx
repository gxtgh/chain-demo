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
