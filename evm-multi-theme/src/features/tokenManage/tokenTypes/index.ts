import { createElement, type ReactNode } from 'react'
import type { ChainDefinition } from '@/config/chains'
import type { DividendTokenManageInfo } from '../business/model'
import type { useTokenManageActionRunner } from '../business/useTokenManageActionRunner'
import { DividendTokenManageView } from './dividend/dividend-token-manage-view'

type BaseTokenManageRendererProps = {
  chainDefinition: ChainDefinition
  role: 'owner' | 'fund' | 'viewer'
  isConnected: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  runner: ReturnType<typeof useTokenManageActionRunner>
}

export const tokenManageRendererRegistry = {
  dividend: (props: BaseTokenManageRendererProps & { info: DividendTokenManageInfo }): ReactNode =>
    createElement(DividendTokenManageView, props),
}
