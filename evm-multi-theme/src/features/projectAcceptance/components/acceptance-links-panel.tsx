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
