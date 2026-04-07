import { useEffect, useMemo, useState } from 'react'
import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { StructuredData } from '@/components/common/structured-data'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import type { TokenDisplayItem } from '@/components/common/token-display'
import {
  buildPoolTokenOptions,
  getDefaultTokenTaxValues,
  getTaxExchangeOptions,
  mergeTokenOptions,
  type TokenTaxFormValues,
  type TokenTaxSubmitValues,
  type TokenTaxViewModel,
} from '../business/model'
import { useTokenTaxForm } from '../business/useTokenTaxForm'
import { useTokenTaxSubmit } from '../business/useTokenTaxSubmit'
import { TokenTaxFormPanel } from './token-tax-form-panel'
import { TokenTaxSeoContent } from './token-tax-seo-content'
import { buildTokenTaxFaqStructuredData, getTokenTaxFaqVars } from './token-tax-seo-data'
import { TokenTaxNextSteps } from './token-tax-next-steps'
import { TokenTaxOverviewCard } from './token-tax-overview-card'
import '@/features/tokenCreation/styles.scss'
import '../styles.scss'

export function TokenTaxCreationPage() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticTokenTaxCreationPage />
  }

  return <InteractiveTokenTaxCreationPage />
}

function InteractiveTokenTaxCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const form = useTokenTaxForm(chainDefinition, t)
  const exchanges = useMemo(() => getTaxExchangeOptions(chainDefinition), [chainDefinition])
  const [poolTokens, setPoolTokens] = useState<TokenDisplayItem[]>(() => buildPoolTokenOptions(chainDefinition))
  const submit = useTokenTaxSubmit(chainDefinition, form.formValues.exchange, t, () => form.isValid)
  const seo = getPageSeo('tax-token-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenTaxFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenTaxFaqStructuredData(t, faqVars)

  useEffect(() => {
    setPoolTokens(buildPoolTokenOptions(chainDefinition))
  }, [chainDefinition])

  const model: TokenTaxViewModel = {
    chainDefinition,
    formValues: form.formValues,
    errors: form.errors,
    exchanges,
    poolTokens,
    creationFee: submit.creationFee,
    feeLoading: submit.feeLoading,
    loading: submit.loading,
    submitStep: submit.submitStep,
    result: submit.result,
    successModalOpen: submit.successModalOpen,
    failureModalOpen: submit.failureModalOpen,
    updateField: (key, value) => {
      form.updateField(key, value)
      submit.clearResult()
    },
    onPoolTokenResolved: (token) => {
      setPoolTokens((current) => mergeTokenOptions(current, [token]))
    },
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }

      const { name, symbol, totalSupply, decimals, buyTax, sellTax, taxFeeReceiveAddress, exchange, poolToken } = form.formValues
      if (decimals == null) {
        return
      }

      const submitValues: TokenTaxSubmitValues = {
        name,
        symbol,
        totalSupply,
        decimals,
        buyTax,
        sellTax,
        taxFeeReceiveAddress,
        exchange,
        poolToken,
      }

      await submit.submit(submitValues)
    },
    onCancelFlow: submit.cancelFlow,
    onCloseSuccessModal: submit.closeSuccessModal,
    onCloseFailureModal: submit.closeFailureModal,
    onClearResult: submit.clearResult,
    t,
  }

  return renderTokenTaxCreationLayout({
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

function StaticTokenTaxCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('tax-token-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })
  const faqVars = getTokenTaxFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenTaxFaqStructuredData(t, faqVars)

  const model: TokenTaxViewModel = {
    chainDefinition,
    formValues: getDefaultTokenTaxValues(chainDefinition),
    errors: {},
    exchanges: getTaxExchangeOptions(chainDefinition),
    poolTokens: buildPoolTokenOptions(chainDefinition),
    creationFee: null,
    feeLoading: true,
    loading: false,
    submitStep: null,
    result: null,
    successModalOpen: false,
    failureModalOpen: false,
    updateField: createStaticUpdateField,
    onPoolTokenResolved: () => undefined,
    onSubmit: async () => undefined,
    onCancelFlow: () => undefined,
    onCloseSuccessModal: () => undefined,
    onCloseFailureModal: () => undefined,
    onClearResult: () => undefined,
    t,
  }

  return renderTokenTaxCreationLayout({
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

function renderTokenTaxCreationLayout({
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
  model: TokenTaxViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenTaxViewModel['chainDefinition']
  faqStructuredData: ReturnType<typeof buildTokenTaxFaqStructuredData>
  hasThemeQuery: boolean
}) {
  const chainLabel = getChainFullName(chainDefinition)
  const header = (
    <PageHeader
      eyebrow={t('tokenTaxCreation.eyebrow')}
      title={t('tokenTaxCreation.title')}
      description={t('tokenTaxCreation.description', {
        chain: chainLabel,
        tokenType: chainDefinition.tokenType,
      })}
    />
  )

  return (
    <section className={`page-stack token-creation-page token-tax-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'tax-token-creation')}
              alternates={buildAlternatePageLinks(chain as never, 'tax-token-creation')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            {hasThemeQuery ? null : <StructuredData id="token-tax-creation-faq" data={faqStructuredData} />}
            <div id="token-tax-creation-form">
              <TokenTaxFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenTaxOverviewCard chainDefinition={chainDefinition} t={t} />
              <TokenTaxNextSteps t={t} />
              <TokenTaxSeoContent chainDefinition={chainDefinition} t={t} />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function createStaticUpdateField<Key extends keyof TokenTaxFormValues>(_key: Key, _value: TokenTaxFormValues[Key]) {
  return undefined
}
