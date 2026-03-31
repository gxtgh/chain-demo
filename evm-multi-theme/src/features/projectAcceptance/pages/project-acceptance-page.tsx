import { useMemo } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import { PageSeo } from '@/components/common/page-seo'
import { getPageSeo } from '@/config/seo'
import { buildPagePath } from '@/config/routes'
import { AcceptanceHero } from '../components/acceptance-hero'
import { AcceptanceSummaryCards } from '../components/acceptance-summary-cards'
import { AcceptanceFunctionTable } from '../components/acceptance-function-table'
import { AcceptanceRoleBoard } from '../components/acceptance-role-board'
import { AcceptanceTaskList } from '../components/acceptance-task-list'
import { AcceptanceRiskPanel } from '../components/acceptance-risk-panel'
import { AcceptanceLinksPanel } from '../components/acceptance-links-panel'
import { getAcceptanceData } from '../config/acceptance-data'

export function ProjectAcceptancePage() {
  const { lang, chain, theme, themeColor, t, chainDefinition } = useRouteContext()
  const functions = useMemo(() => getAcceptanceData(lang, chain, theme, themeColor), [chain, lang, theme, themeColor])
  const primaryFunction = functions[0]
  const seo = getPageSeo('project-acceptance', {
    t,
    chainName: chainDefinition.name,
    nativeSymbol: chainDefinition.nativeSymbol,
    tokenType: chainDefinition.tokenType,
  })

  const summaryRows = [
    { label: t('acceptance.summary.project'), value: t('app.name') },
    { label: t('acceptance.summary.stage'), value: primaryFunction.currentStage },
    { label: t('acceptance.summary.completion'), value: `${primaryFunction.completion}%` },
    { label: t('acceptance.summary.risks'), value: primaryFunction.risks.length },
    { label: t('acceptance.summary.completedFeatures'), value: functions.filter((item) => item.status === 'done').length },
    { label: t('acceptance.summary.inProgressFeatures'), value: functions.filter((item) => item.status === 'in_progress').length },
    { label: t('acceptance.summary.backlogFeatures'), value: functions.filter((item) => item.status === 'not_started').length },
  ]

  const links = [
    { label: t('nav.tokenCreation'), href: primaryFunction.route },
    {
      label: `${t('nav.tokenCreation')} · ${t('theme.purple')}`,
      href: buildPagePath(lang, chain, 'token-creation', { theme, themeColor: 'purple' }),
    },
    {
      label: `${t('nav.tokenCreation')} · ${t('theme.green')}`,
      href: buildPagePath(lang, chain, 'token-creation', { theme, themeColor: 'green' }),
    },
  ]

  return (
    <section className="page-stack">
      <PageSeo {...seo} />
      <AcceptanceHero
        eyebrow={t('acceptance.eyebrow')}
        title={t('acceptance.title')}
        description={t('acceptance.description')}
      />

      <AcceptanceSummaryCards rows={summaryRows} />

      <AcceptanceFunctionTable items={functions} title={t('acceptance.sections.functions')} openLabel={t('acceptance.actions.openFeature')} />

      <AcceptanceRoleBoard
        rows={primaryFunction.roles}
        title={t('acceptance.sections.roles')}
        roleLabel={t('acceptance.labels.role')}
        statusLabel={t('acceptance.labels.status')}
        ownerLabel={t('acceptance.labels.owner')}
        updatedLabel={t('acceptance.labels.updatedAt')}
        translateRole={(role) => t(`acceptance.roles.${role}`)}
        translateStatus={(status) => t(`acceptance.statuses.${status}`)}
      />

      <div className="two-column-grid">
        <AcceptanceTaskList
          tasks={primaryFunction.tasks}
          title={t('acceptance.sections.tasks')}
          labels={{
            role: t('acceptance.labels.role'),
            status: t('acceptance.labels.status'),
            priority: t('acceptance.labels.priority'),
            blocked: t('acceptance.labels.blocked'),
            note: t('acceptance.labels.note'),
          }}
          translateRole={(role) => t(`acceptance.roles.${role}`)}
          translateStatus={(status) => t(`acceptance.statuses.${status}`)}
          translatePriority={(priority) => t(`acceptance.priorities.${priority}`)}
        />
        <div className="stack-column">
          <AcceptanceRiskPanel items={primaryFunction.risks} title={t('acceptance.sections.risks')} />
          <AcceptanceLinksPanel title={t('acceptance.sections.links')} links={links} />
        </div>
      </div>
    </section>
  )
}
