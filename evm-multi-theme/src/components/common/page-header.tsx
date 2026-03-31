import { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  side?: ReactNode
}

export function PageHeader({ eyebrow, title, description, side }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {side ? <div className="page-header-side">{side}</div> : null}
    </header>
  )
}
