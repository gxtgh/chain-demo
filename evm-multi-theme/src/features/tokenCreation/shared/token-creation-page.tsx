import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { StructuredData } from '@/components/common/structured-data'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import {
  defaultTokenCreationValues,
  type TokenCreationFormValues,
  type TokenCreationSubmitValues,
  type TokenCreationViewModel,
} from '../business/model'
import { useTokenCreationForm } from '../business/useTokenCreationForm'
import { useTokenCreationSubmit } from '../business/useTokenCreationSubmit'
import { TokenCreationFormPanel } from './token-creation-form-panel'
import { TokenCreationSeoContent } from './token-creation-seo-content'
import { buildTokenCreationFaqStructuredData, getTokenCreationFaqVars } from './token-creation-seo-data'
import { TokenNextSteps } from './token-next-steps'
import { TokenPermissionCard } from './token-permission-card'
import '../styles.scss'

export function TokenCreationPage() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticTokenCreationPage />
  }

  return <InteractiveTokenCreationPage />
}

function InteractiveTokenCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const form = useTokenCreationForm(t)
  const submit = useTokenCreationSubmit(chainDefinition, t, () => form.isValid)
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenCreationFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenCreationFaqStructuredData(t, faqVars)

  const model: TokenCreationViewModel = {
    chainDefinition,
    formValues: form.formValues,
    errors: form.errors,
    updateField: (key, value) => {
      form.updateField(key, value)
      submit.clearResult()
    },
    creationFee: submit.creationFee,
    feeLoading: submit.feeLoading,
    loading: submit.loading,
    submitStep: submit.submitStep,
    result: submit.result,
    successModalOpen: submit.successModalOpen,
    failureModalOpen: submit.failureModalOpen,
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }

      const { name, symbol, totalSupply, decimals } = form.formValues
      if (decimals == null) {
        return
      }

      const submitValues: TokenCreationSubmitValues = {
        name,
        symbol,
        totalSupply,
        decimals,
      }

      await submit.submit(submitValues)
    },
    onCancelFlow: submit.cancelFlow,
    onCloseSuccessModal: submit.closeSuccessModal,
    onCloseFailureModal: submit.closeFailureModal,
    onClearResult: submit.clearResult,
    t,
  }

  const header = (
    <>
      <PageHeader
        eyebrow={t('tokenCreation.eyebrow')}
        title={t('tokenCreation.title')}
        description={t('tokenCreation.description', {
          standard: chainDefinition.tokenType,
          tokenType: chainDefinition.tokenType,
        })}
      />
    </>
  )

  return (
    <section className={`page-stack token-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang, chain, 'token-creation')}
              alternates={buildAlternatePageLinks(chain, 'token-creation')}
              locale={normalizeLocaleTag(lang)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            {hasThemeQuery ? null : <StructuredData id="token-creation-faq" data={faqStructuredData} />}
            <div id="token-creation-form">
              <TokenCreationFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenPermissionCard chainDefinition={chainDefinition} t={t} />
              <TokenNextSteps t={t} />
              <TokenCreationSeoContent chainDefinition={chainDefinition} t={t} />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function StaticTokenCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenCreationFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenCreationFaqStructuredData(t, faqVars)

  const model: TokenCreationViewModel = {
    chainDefinition,
    formValues: defaultTokenCreationValues,
    errors: {},
    updateField: createStaticUpdateField,
    creationFee: null,
    feeLoading: true,
    loading: false,
    submitStep: null,
    result: null,
    successModalOpen: false,
    failureModalOpen: false,
    onSubmit: async () => undefined,
    onCancelFlow: () => undefined,
    onCloseSuccessModal: () => undefined,
    onCloseFailureModal: () => undefined,
    onClearResult: () => undefined,
    t,
  }

  return renderTokenCreationLayout({
    seo,
    model,
    t,
    lang,
    chain,
    themeColor,
    chainDefinition,
    faqStructuredData,
    hasThemeQuery,
  })
}

function renderTokenCreationLayout({
  seo,
  model,
  t,
  lang,
  chain,
  themeColor,
  chainDefinition,
  faqStructuredData,
  hasThemeQuery,
}: {
  seo: ReturnType<typeof getPageSeo>
  model: TokenCreationViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenCreationViewModel['chainDefinition']
  faqStructuredData: ReturnType<typeof buildTokenCreationFaqStructuredData>
  hasThemeQuery: boolean
}) {
  const header = (
    <PageHeader
      eyebrow={t('tokenCreation.eyebrow')}
      title={t('tokenCreation.title')}
      description={t('tokenCreation.description', {
        standard: chainDefinition.tokenType,
        tokenType: chainDefinition.tokenType,
      })}
    />
  )

  return (
    <section className={`page-stack token-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'token-creation')}
              alternates={buildAlternatePageLinks(chain as never, 'token-creation')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            {hasThemeQuery ? null : <StructuredData id="token-creation-faq" data={faqStructuredData} />}
            <div id="token-creation-form">
              <TokenCreationFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenPermissionCard chainDefinition={chainDefinition} t={t} />
              <TokenNextSteps t={t} />
              <TokenCreationSeoContent chainDefinition={chainDefinition} t={t} />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function createStaticUpdateField<Key extends keyof TokenCreationFormValues>(_key: Key, _value: TokenCreationFormValues[Key]) {
  return undefined
}
