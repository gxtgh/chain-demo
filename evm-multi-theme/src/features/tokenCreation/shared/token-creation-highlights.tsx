export function TokenCreationHighlights({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <ul className="feature-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
