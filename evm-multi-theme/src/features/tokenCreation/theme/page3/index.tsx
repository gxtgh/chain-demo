import { ReactNode } from 'react'
import type { TokenCreationViewModel } from '../../business/types'
import { TokenCreationFormPanel } from '../../shared/token-creation-form-panel'

export function TokenCreationThemePage3({
  header,
  model,
}: {
  header: ReactNode
  model: TokenCreationViewModel
}) {
  return (
    <section className="page-stack theme-page theme-page3">
      {header}
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <TokenCreationFormPanel model={model} />
        </div>
      </div>
    </section>
  )
}
