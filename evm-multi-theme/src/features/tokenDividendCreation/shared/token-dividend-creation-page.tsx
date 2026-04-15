import { useEffect, useMemo, useState } from 'react'
import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import type { TokenDisplayItem } from '@/components/common/token-display'
import {
  buildDividendPoolTokenOptions,
  buildDividendRewardTokenOptions,
  getDefaultTokenDividendValues,
  getDividendExchangeOptions,
  mergeTokenOptions,
  type TokenDividendFormValues,
  type TokenDividendSubmitValues,
  type TokenDividendViewModel,
} from '../business/model'
import { useTokenDividendForm } from '../business/useTokenDividendForm'
import { useTokenDividendSubmit } from '../business/useTokenDividendSubmit'
import { TokenDividendOverviewCard } from './token-dividend-overview-card'
import { TokenDividendNextSteps } from './token-dividend-next-steps'
import { TokenDividendFormPanel } from './token-dividend-form-panel'
import '@/features/tokenCreation/styles.scss'
import '../styles.scss'

export function TokenDividendCreationPage() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticTokenDividendCreationPage />
  }

  return <InteractiveTokenDividendCreationPage />
}

function InteractiveTokenDividendCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const form = useTokenDividendForm(chainDefinition, t)
  const exchanges = useMemo(() => getDividendExchangeOptions(chainDefinition), [chainDefinition])
  const [poolTokens, setPoolTokens] = useState<TokenDisplayItem[]>(() => buildDividendPoolTokenOptions(chainDefinition))
  const [rewardTokens, setRewardTokens] = useState<TokenDisplayItem[]>(() => buildDividendRewardTokenOptions(chainDefinition))
  const submit = useTokenDividendSubmit(chainDefinition, form.formValues.exchange, t, () => form.isValid)
  const seo = getPageSeo('token-dividend-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
    nativeSymbol: chainDefinition.nativeToken.symbol,
  })

  useEffect(() => {
    setPoolTokens(buildDividendPoolTokenOptions(chainDefinition))
    setRewardTokens(buildDividendRewardTokenOptions(chainDefinition))
  }, [chainDefinition])

  const model: TokenDividendViewModel = {
    chainDefinition,
    formValues: form.formValues,
    errors: form.errors,
    exchanges,
    poolTokens,
    rewardTokens,
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
      setRewardTokens((current) => mergeTokenOptions(current, [token]))
    },
    onRewardTokenResolved: (token) => {
      setRewardTokens((current) => mergeTokenOptions(current, [token]))
      setPoolTokens((current) => mergeTokenOptions(current, [token]))
    },
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }

      const { decimals } = form.formValues
      if (decimals == null) {
        return
      }

      const selectedExchange = exchanges.find((item) => item.value === form.formValues.exchange)
      if (!selectedExchange?.routerAddress) {
        return
      }

      const submitValues: TokenDividendSubmitValues = {
        ...form.formValues,
        decimals,
        swapRouter: selectedExchange.routerAddress,
      }

      await submit.submit(submitValues)
    },
    onCancelFlow: submit.cancelFlow,
    onCloseSuccessModal: submit.closeSuccessModal,
    onCloseFailureModal: submit.closeFailureModal,
    onClearResult: submit.clearResult,
    t,
  }

  return renderTokenDividendCreationLayout({
    seo,
    model,
    t,
    lang,
    chain,
    themeColor,
    chainDefinition,
    hasThemeQuery,
  })
}

function StaticTokenDividendCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-dividend-creation', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
    nativeSymbol: chainDefinition.nativeToken.symbol,
  })

  const model: TokenDividendViewModel = {
    chainDefinition,
    formValues: getDefaultTokenDividendValues(chainDefinition),
    errors: {},
    exchanges: getDividendExchangeOptions(chainDefinition),
    poolTokens: buildDividendPoolTokenOptions(chainDefinition),
    rewardTokens: buildDividendRewardTokenOptions(chainDefinition),
    creationFee: null,
    feeLoading: true,
    loading: false,
    submitStep: null,
    result: null,
    successModalOpen: false,
    failureModalOpen: false,
    updateField: createStaticUpdateField,
    onPoolTokenResolved: () => undefined,
    onRewardTokenResolved: () => undefined,
    onSubmit: async () => undefined,
    onCancelFlow: () => undefined,
    onCloseSuccessModal: () => undefined,
    onCloseFailureModal: () => undefined,
    onClearResult: () => undefined,
    t,
  }

  return renderTokenDividendCreationLayout({
    seo,
    model,
    t,
    lang,
    chain,
    themeColor,
    chainDefinition,
    hasThemeQuery,
  })
}

function renderTokenDividendCreationLayout({
  seo,
  model,
  t,
  lang,
  chain,
  themeColor,
  chainDefinition,
  hasThemeQuery,
}: {
  seo: ReturnType<typeof getPageSeo>
  model: TokenDividendViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenDividendViewModel['chainDefinition']
  hasThemeQuery: boolean
}) {
  const chainLabel = getChainFullName(chainDefinition)
  const header = (
    <PageHeader
      eyebrow={t('tokenDividendCreation.eyebrow')}
      title={t('tokenDividendCreation.title')}
      description={t('tokenDividendCreation.description', {
        chain: chainLabel,
        tokenType: chainDefinition.tokenType,
      })}
    />
  )

  return (
    <section className={`page-stack token-creation-page token-dividend-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'token-dividend-creation')}
              alternates={buildAlternatePageLinks(chain as never, 'token-dividend-creation')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            <div id="token-dividend-creation-form">
              <TokenDividendFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenDividendOverviewCard chainDefinition={chainDefinition} t={t} />
              <TokenDividendNextSteps t={t} />
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

function createStaticUpdateField<Key extends keyof TokenDividendFormValues>(_key: Key, _value: TokenDividendFormValues[Key]) {
  return undefined
}
