import {
  ControlOutlined,
  DashboardOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Alert, Button, Input, Spin } from 'antd'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import { getChainFullName } from '@/config/chains'
import { FieldLabelWithTooltip } from '@/features/tokenCreation/shared/field-label-with-tooltip'
import type { ChainDefinition } from '@/config/chains'

type TokenManageShellProps = {
  lang: string
  chain: string
  hasThemeQuery: boolean
  themeColor: string
  chainDefinition: ChainDefinition
  tokenAddressInput: string
  setTokenAddressInput: (value: string) => void
  onLoadToken: () => void
  onClearToken: () => void
  tokenAddress: string
  isLoading: boolean
  isError: boolean
  errorKey?: string
  tokenInfoContent?: ReactNode
  tokenActionContent?: ReactNode
  t: (key: string, vars?: Record<string, string | number>) => string
}

export function TokenManageShell({
  lang,
  chain,
  hasThemeQuery,
  themeColor,
  chainDefinition,
  tokenAddressInput,
  setTokenAddressInput,
  onLoadToken,
  onClearToken,
  tokenAddress,
  isLoading,
  isError,
  errorKey,
  tokenInfoContent,
  tokenActionContent,
  t,
}: TokenManageShellProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const emptyFlowItems = [
    { key: 'target', icon: <SearchOutlined /> },
    { key: 'read', icon: <DashboardOutlined /> },
    { key: 'modules', icon: <ToolOutlined /> },
  ] as const
  const emptyPreviewItems = [
    { key: 'profile', icon: <DashboardOutlined /> },
    { key: 'parameters', icon: <ControlOutlined /> },
    { key: 'permissions', icon: <SafetyCertificateOutlined /> },
    { key: 'actions', icon: <SafetyOutlined /> },
  ] as const
  const emptyNotes = [
    { key: 'owner' },
    { key: 'detection' },
    { key: 'network' },
  ] as const
  const header = (
    <PageHeader
      eyebrow={t('tokenManage.eyebrow')}
      title={t('tokenManage.title')}
      description={t('tokenManage.description', { chain: chainLabel })}
    />
  )
  const hasTokenContent = Boolean(tokenInfoContent || tokenActionContent)

  return (
    <section className={`page-stack token-creation-page token-manage-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              title={t('tokenManage.seo.title', { chain: chainLabel })}
              description={t('tokenManage.seo.description', { chain: chainLabel })}
              keywords={t('tokenManage.seo.keywords', { chain: chainLabel })}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'token-manage')}
              alternates={buildAlternatePageLinks(chain as never, 'token-manage')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'noindex,follow'}
            />

            <section className="surface-card form-card manage-search-card">
              <div className="manage-search-row">
                <label className="field manage-search-field">
                  <FieldLabelWithTooltip
                    label={t('tokenManage.search.label')}
                    tooltip={t('tokenManage.search.tooltip')}
                  />
                  <Input
                    className="token-form-input"
                    allowClear
                    placeholder={t('tokenManage.search.placeholder')}
                    value={tokenAddressInput}
                    onChange={(event) => {
                      setTokenAddressInput(event.target.value);
                    }}
                    onPressEnter={onLoadToken}
                    onClear={onClearToken}
                  />
                </label>
                <div className="manage-search-actions">
                  <Button type="primary" className="primary-button ant-primary-button" onClick={onLoadToken}>
                    {t('tokenManage.search.load')}
                  </Button>
                </div>
              </div>
            </section>
            {!tokenAddress ? (
              <section className="surface-card manage-empty-card">
                <div className="manage-empty-layout">
                  <article className="manage-empty-hero">
                    <span className="manage-empty-kicker">
                      {t('tokenManage.empty.kicker', { chain: chainLabel })}
                    </span>
                    <div className="manage-empty-copy">
                      <h3>{t('tokenManage.empty.title')}</h3>
                      <p>{t('tokenManage.empty.description')}</p>
                    </div>
                    <div className="manage-empty-flow">
                      {emptyFlowItems.map((item, index) => (
                        <article className="manage-empty-flow-item" key={item.key}>
                          <div className="manage-empty-flow-icon">{item.icon}</div>
                          <div className="manage-empty-flow-copy">
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <strong>{t(`tokenManage.empty.flow.${item.key}.title`)}</strong>
                            <p>{t(`tokenManage.empty.flow.${item.key}.description`)}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </article>

                  <aside className="manage-empty-preview">
                    <div className="manage-empty-preview-head">
                      <span>{t('tokenManage.empty.previewLabel')}</span>
                    </div>
                    <div className="manage-empty-preview-grid">
                      {emptyPreviewItems.map((item) => (
                        <article className="manage-empty-preview-item" key={item.key}>
                          <div className="manage-empty-preview-icon">{item.icon}</div>
                          <div className="manage-empty-preview-copy">
                            <strong>{t(`tokenManage.empty.preview.${item.key}.title`)}</strong>
                            <p>{t(`tokenManage.empty.preview.${item.key}.description`)}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </aside>
                </div>

                <div className="manage-empty-note-grid">
                  {emptyNotes.map((item) => (
                    <article className="manage-empty-note" key={item.key}>
                      <span>{t(`tokenManage.empty.notes.${item.key}.label`)}</span>
                      <strong>{t(`tokenManage.empty.notes.${item.key}.title`)}</strong>
                      <p>{t(`tokenManage.empty.notes.${item.key}.description`, { chain: chainLabel })}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {isLoading ? (
              <section className="surface-card manage-loading-card">
                <Spin />
                <span>{t('tokenManage.loading')}</span>
              </section>
            ) : null}

            {isError ? (
              <Alert
                className="surface-card manage-error-card"
                type="error"
                showIcon
                message={t(errorKey ?? 'tokenManage.errors.loadFailed')}
              />
            ) : null}

            {hasTokenContent ? (
              <>
                {tokenInfoContent ? (
                  <ManageZone
                    label={t('tokenManage.zones.info.label')}
                    title={t('tokenManage.zones.info.title')}
                    tone="info"
                  >
                    {tokenInfoContent}
                  </ManageZone>
                ) : null}

                {tokenActionContent ? (
                  <ManageZone
                    label={t('tokenManage.zones.actions.label')}
                    title={t('tokenManage.zones.actions.title')}
                    tone="actions"
                  >
                    {tokenActionContent}
                  </ManageZone>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function ManageZone({
  label,
  title,
  description,
  tone,
  children,
}: {
  label: string
  title: string
  description?: string
  tone: 'info' | 'actions'
  children: ReactNode
}) {
  return (
    <section className={`manage-zone-shell ${tone}`}>
      <div className="manage-zone-head">
        <span className="manage-zone-kicker">{label}</span>
        <div className="manage-zone-copy">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      <div className="manage-zone-stack">{children}</div>
    </section>
  )
}
