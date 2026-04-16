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
  children?: ReactNode
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
  children,
  t,
}: TokenManageShellProps) {
  const chainLabel = getChainFullName(chainDefinition)
  const header = (
    <PageHeader
      eyebrow={t('tokenManage.eyebrow')}
      title={t('tokenManage.title')}
      description={t('tokenManage.description', { chain: chainLabel })}
    />
  )

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
                <div className="manage-empty-copy">
                  <h3>{t('tokenManage.empty.title')}</h3>
                  <p>{t('tokenManage.empty.description')}</p>
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

            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
