import { createContext, useContext, type ReactNode } from 'react'

export type RenderMode = 'interactive' | 'static'

const RenderModeContext = createContext<RenderMode>('interactive')

export function RenderModeProvider({
  children,
  mode,
}: {
  children: ReactNode
  mode: RenderMode
}) {
  return <RenderModeContext.Provider value={mode}>{children}</RenderModeContext.Provider>
}

export function useRenderMode() {
  return useContext(RenderModeContext)
}
