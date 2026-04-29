import { createElement, type ReactNode } from 'react'
import {
  DividendTokenManageActionsSection,
  DividendTokenManageInfoSection,
  type DividendTokenManageViewProps,
} from './dividend/dividend-token-manage-view'

type TokenManageRendererDefinition<TProps> = {
  renderInfo: (props: TProps) => ReactNode
  renderActions: (props: TProps) => ReactNode
}

export const tokenManageRendererRegistry = {
  dividend: {
    renderInfo: (props: DividendTokenManageViewProps): ReactNode =>
      createElement(DividendTokenManageInfoSection, props),
    renderActions: (props: DividendTokenManageViewProps): ReactNode =>
      createElement(DividendTokenManageActionsSection, props),
  } satisfies TokenManageRendererDefinition<DividendTokenManageViewProps>,
}
