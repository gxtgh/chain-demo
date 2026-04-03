import type { ReactNode } from 'react'
import { AppProviders } from './providers'
import { RenderModeProvider, type RenderMode } from './render-mode'

export function AppFrame({
  children,
  mode,
}: {
  children: ReactNode
  mode: RenderMode
}) {
  return (
    <RenderModeProvider mode={mode}>
      <AppProviders mode={mode}>{children}</AppProviders>
    </RenderModeProvider>
  )
}
