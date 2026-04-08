import { message } from 'antd'
import { useAccount } from 'wagmi'
import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { StructuredData } from '@/components/common/structured-data'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import {
  defaultTokenVanityValues,
  type TokenVanityViewModel,
} from '../business/model'
import { useTokenVanityForm } from '../business/useTokenVanityForm'
import { useTokenVanitySubmit } from '../business/useTokenVanitySubmit'
import { useVanityAddressSearch } from '../business/useVanityAddressSearch'
import { TokenVanityFormPanel } from './token-vanity-form-panel'
import { TokenVanityNextSteps } from './token-vanity-next-steps'
import { TokenVanityOverviewCard } from './token-vanity-overview-card'
import { TokenVanitySeoContent } from './token-vanity-seo-content'
import { buildTokenVanityFaqStructuredData, getTokenVanityFaqVars } from './token-vanity-seo-data'
import '@/features/tokenCreation/styles.scss'
import '../styles.scss'

export function TokenVanityCreationPage() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticTokenVanityCreationPage />
  }

  return <InteractiveTokenVanityCreationPage />
}

function InteractiveTokenVanityCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const { address } = useAccount()
  const chainLabel = getChainFullName(chainDefinition)
  const form = useTokenVanityForm(t)
  const submit = useTokenVanitySubmit(chainDefinition, t, () => form.isValid)
  const search = useVanityAddressSearch({
    chainDefinition,
    factoryAddress: submit.factoryAddress,
    tokenCreationCode: submit.tokenCreationCode,
    formValues: form.formValues,
    address,
    t,
    validateBeforeSearch: () => form.isValid,
  })
  const seo = getPageSeo('token-vanity-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenVanityFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenVanityFaqStructuredData(t, faqVars)

  const model: TokenVanityViewModel = {
    chainDefinition,
    formValues: form.formValues,
    errors: form.errors,
    updateField: (key, value) => {
      form.updateField(key, value)
      submit.clearResult()
    },
    creationFee: submit.creationFee,
    feeLoading: submit.feeLoading,
    creationCodeLoading: submit.creationCodeLoading,
    factoryAvailable: submit.factoryAvailable,
    resourceError: submit.resourceError,
    loading: submit.loading,
    search: search.search,
    submitStep: submit.submitStep,
    result: submit.result,
    successModalOpen: submit.successModalOpen,
    failureModalOpen: submit.failureModalOpen,
    onStartGenerate: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }

      await search.startGenerate()
    },
    onStopGenerate: search.stopGenerate,
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }

      if (!search.search.match) {
        message.warning(t('tokenVanityCreation.errors.generateRequiredManual'))
        return
      }

      const { name, symbol, totalSupply, decimals, prefix, suffix } = form.formValues
      if (decimals == null) {
        return
      }

      await submit.submit({
        name,
        symbol,
        totalSupply,
        decimals,
        prefix,
        suffix,
        salt: search.search.match.salt,
        predictedAddress: search.search.match.address,
      })
    },
    onCancelFlow: submit.cancelFlow,
    onCloseSuccessModal: submit.closeSuccessModal,
    onCloseFailureModal: submit.closeFailureModal,
    onClearResult: submit.clearResult,
    t,
  }

  return renderTokenVanityCreationLayout({
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

function StaticTokenVanityCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-vanity-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenVanityFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenVanityFaqStructuredData(t, faqVars)

  const model: TokenVanityViewModel = {
    chainDefinition,
    formValues: defaultTokenVanityValues,
    errors: {},
    updateField: createStaticUpdateField,
    creationFee: null,
    feeLoading: true,
    creationCodeLoading: false,
    factoryAvailable: true,
    resourceError: null,
    loading: false,
    search: {
      status: 'idle',
      generatedCount: 0,
      speed: 0,
      progress: 0,
      estimatedSeconds: null,
      difficulty: 1n,
      match: null,
    },
    submitStep: null,
    result: null,
    successModalOpen: false,
    failureModalOpen: false,
    onStartGenerate: async () => undefined,
    onStopGenerate: () => undefined,
    onSubmit: async () => undefined,
    onCancelFlow: () => undefined,
    onCloseSuccessModal: () => undefined,
    onCloseFailureModal: () => undefined,
    onClearResult: () => undefined,
    t,
  }

  return renderTokenVanityCreationLayout({
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

function renderTokenVanityCreationLayout({
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
  model: TokenVanityViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenVanityViewModel['chainDefinition']
  faqStructuredData: ReturnType<typeof buildTokenVanityFaqStructuredData>
  hasThemeQuery: boolean
}) {
  const header = (
    <PageHeader
      eyebrow={t('tokenVanityCreation.eyebrow')}
      title={t('tokenVanityCreation.title')}
      description={t('tokenVanityCreation.description', {
        chain: chainDefinition.fullName,
        tokenType: chainDefinition.tokenType,
      })}
    />
  )

  return (
    <section className={`page-stack token-creation-page token-vanity-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'token-vanity-creation')}
              alternates={buildAlternatePageLinks(chain as never, 'token-vanity-creation')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            {hasThemeQuery ? null : <StructuredData id="token-vanity-creation-faq" data={faqStructuredData} />}
            <div id="token-vanity-creation-form">
              <TokenVanityFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenVanityOverviewCard chainDefinition={chainDefinition} t={t} />
              <TokenVanityNextSteps t={t} />
              <TokenVanitySeoContent chainDefinition={chainDefinition} t={t} />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function createStaticUpdateField() {
  return undefined
}
