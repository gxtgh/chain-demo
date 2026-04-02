import { buildPagePath } from '@/config/routes'
import type { SupportedChainKey, SupportedLang } from '@/config/chains'
import type { ThemeColorId, ThemeModeId } from '@/config/theme-registry'

export type AcceptanceStatus = 'not_started' | 'in_progress' | 'blocked' | 'done'
export type AcceptancePriority = 'high' | 'medium' | 'low'
export type AcceptanceRole =
  | 'productDiscovery'
  | 'productDelivery'
  | 'engineering'
  | 'qa'
  | 'lead'
  | 'userAcceptance'

export type AcceptanceTask = {
  id: string
  role: AcceptanceRole
  title: string
  status: AcceptanceStatus
  priority: AcceptancePriority
  blocked: boolean
  note: string
  link?: string
}

export type AcceptanceRoleProgress = {
  role: AcceptanceRole
  status: AcceptanceStatus
  completion: number
  owner: string
  updatedAt: string
  summary: string
}

export type AcceptanceRisk = {
  title: string
  level: AcceptancePriority
  summary: string
  action: string
}

export type AcceptanceFunction = {
  id: string
  title: string
  route: string
  themes: string[]
  status: AcceptanceStatus
  completion: number
  summary: string
  currentStage: string
  roles: AcceptanceRoleProgress[]
  tasks: AcceptanceTask[]
  risks: AcceptanceRisk[]
}

export function getAcceptanceData(
  lang: SupportedLang,
  chain: SupportedChainKey,
  theme: ThemeModeId,
  themeColor: ThemeColorId,
): AcceptanceFunction[] {
  return [
    {
      id: 'token-creation',
      title: 'Token Creation Pilot',
      route: buildPagePath(lang, chain, 'token-creation', { theme, themeColor }),
      themes: ['orange', 'purple', 'green'],
      status: 'in_progress',
      completion: 78,
      currentStage: 'Pilot implementation',
      summary: 'Shared business logic is live, three themes are connected, and the acceptance workspace tracks all roles.',
      roles: [
        {
          role: 'productDiscovery',
          status: 'done',
          completion: 100,
          owner: 'PM-01',
          updatedAt: '2026-03-31',
          summary: 'Pilot scope, value proposition, and theme positioning are locked.',
        },
        {
          role: 'productDelivery',
          status: 'done',
          completion: 100,
          owner: 'PD-01',
          updatedAt: '2026-03-31',
          summary: 'Route shape, layout zones, and shared-vs-theme boundaries are documented.',
        },
        {
          role: 'engineering',
          status: 'in_progress',
          completion: 82,
          owner: 'DEV-01',
          updatedAt: '2026-03-31',
          summary: 'Core app shell, wallet layer, theme pages, and token submission flow are implemented.',
        },
        {
          role: 'qa',
          status: 'in_progress',
          completion: 60,
          owner: 'QA-01',
          updatedAt: '2026-03-31',
          summary: 'Routing, wallet, and theme regressions are covered. On-chain verification still needs final pass.',
        },
        {
          role: 'lead',
          status: 'in_progress',
          completion: 75,
          owner: 'LEAD-01',
          updatedAt: '2026-03-31',
          summary: 'Progress is healthy, with final chain validation as the remaining gate for wider rollout.',
        },
        {
          role: 'userAcceptance',
          status: 'not_started',
          completion: 30,
          owner: 'UAT-POOL',
          updatedAt: '2026-03-31',
          summary: 'End-to-end user validation is waiting for the first integrated test pass on all pilot chains.',
        },
      ],
      tasks: [
        {
          id: 'pd-01',
          role: 'productDiscovery',
          title: 'Define the pilot value proposition',
          status: 'done',
          priority: 'high',
          blocked: false,
          note: 'Locked around multi-theme single-page token creation.',
        },
        {
          id: 'pd-02',
          role: 'productDelivery',
          title: 'Freeze route pattern and query-driven theme switching',
          status: 'done',
          priority: 'high',
          blocked: false,
          note: 'Adopted /:lang/:chain/token-creation?theme=color.',
        },
        {
          id: 'eng-01',
          role: 'engineering',
          title: 'Build app shell, wallet layer, and route guard',
          status: 'done',
          priority: 'high',
          blocked: false,
          note: 'wagmi injected wallet, lang/chain/page routing, and topbar are in place.',
        },
        {
          id: 'eng-02',
          role: 'engineering',
          title: 'Implement shared token creation business service',
          status: 'done',
          priority: 'high',
          blocked: false,
          note: 'Reads creation fee, estimates gas, submits createToken, and parses TokenCreated.',
        },
        {
          id: 'eng-03',
          role: 'engineering',
          title: 'Finish purple and green visual polish',
          status: 'in_progress',
          priority: 'medium',
          blocked: false,
          note: 'Layouts are connected, but final visual refinement is still open.',
          link: buildPagePath(lang, chain, 'token-creation', { theme, themeColor: 'purple' }),
        },
        {
          id: 'qa-01',
          role: 'qa',
          title: 'Run route and theme regression',
          status: 'done',
          priority: 'high',
          blocked: false,
          note: 'Main navigation, theme switching, and invalid param fallbacks are covered.',
        },
        {
          id: 'qa-02',
          role: 'qa',
          title: 'Validate BSC, ETH, and Base live submission paths',
          status: 'in_progress',
          priority: 'high',
          blocked: true,
          note: 'Needs final wallet-based execution check on each pilot chain.',
          link: buildPagePath(lang, chain, 'token-creation', { theme, themeColor: 'orange' }),
        },
        {
          id: 'lead-01',
          role: 'lead',
          title: 'Review pilot readiness and next milestone',
          status: 'in_progress',
          priority: 'medium',
          blocked: false,
          note: 'Awaiting QA confirmation on the live createToken transaction path.',
        },
        {
          id: 'uat-01',
          role: 'userAcceptance',
          title: 'Walk the final user path from open page to token address result',
          status: 'not_started',
          priority: 'medium',
          blocked: false,
          note: 'Planned after live chain verification is complete.',
          link: buildPagePath(lang, chain, 'token-creation', { theme, themeColor: 'orange' }),
        },
      ],
      risks: [
        {
          title: 'Live factory validation still pending',
          level: 'high',
          summary: 'The business flow is implemented, but pilot chains still need fresh wallet-based verification.',
          action: 'Run real token creation on BSC, ETH, and Base with wallet confirmation and event parsing checks.',
        },
        {
          title: 'Theme polish is uneven',
          level: 'medium',
          summary: 'All three themes are live, but the purple and green themes still need more visual refinement to feel product-ready.',
          action: 'Refine spacing, hierarchy, and supporting cards after the core pilot path is validated.',
        },
      ],
    },
  ]
}
