import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { isAddress } from 'ethers'
import { useAccount } from 'wagmi'
import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { StructuredData } from '@/components/common/structured-data'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { buildPagePath } from '@/config/routes'
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
import {
  buildProtectedAddressEntries,
  buildProtectedAddressSet,
  DEAD_ADDRESS,
  findProtectedAddresses,
  splitAddressList,
} from '../business/protected-addresses'
import { useTokenDividendForm } from '../business/useTokenDividendForm'
import { useTokenDividendSubmit } from '../business/useTokenDividendSubmit'
import { TokenDividendOverviewCard } from './token-dividend-overview-card'
import { TokenDividendNextSteps } from './token-dividend-next-steps'
import { TokenDividendFormPanel } from './token-dividend-form-panel'
import { TokenDividendSeoContent } from './token-dividend-seo-content'
import { buildTokenDividendFaqStructuredData, getTokenDividendFaqVars } from './token-dividend-seo-data'
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
  const { t, lang, chain, theme, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const { address } = useAccount()
  const chainLabel = getChainFullName(chainDefinition)
  const form = useTokenDividendForm(chainDefinition, t)
  const exchanges = useMemo(() => getDividendExchangeOptions(chainDefinition), [chainDefinition])
  const [poolTokens, setPoolTokens] = useState<TokenDisplayItem[]>(() => buildDividendPoolTokenOptions(chainDefinition))
  const [rewardTokens, setRewardTokens] = useState<TokenDisplayItem[]>(() => buildDividendRewardTokenOptions(chainDefinition))
  const submit = useTokenDividendSubmit(chainDefinition, form.formValues.exchange, t, () => form.isValid)
  const faqVars = getTokenDividendFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenDividendFaqStructuredData(t, faqVars)
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
    connectedAddress: String(address ?? ''),
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
    manageConsoleUrl: submit.result?.tokenAddress
      ? buildTokenManageUrl(lang, chain, theme, themeColor, submit.result.tokenAddress)
      : undefined,
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

      const resolvedReceiveAddress = form.formValues.receiveAddress.trim() || String(address ?? '')
      const resolvedFundAddress = form.formValues.fundAddress.trim() || String(address ?? '')
      const protectedAddressEntries = buildProtectedAddressEntries([
        { label: t('tokenDividendCreation.labels.protectedReceiveAddress'), address: resolvedReceiveAddress || '-' },
        { label: t('tokenDividendCreation.labels.protectedFundAddress'), address: resolvedFundAddress || '-' },
        { label: t('tokenDividendCreation.labels.protectedRouterAddress'), address: selectedExchange.routerAddress },
        { label: t('tokenDividendCreation.labels.protectedDeadAddress'), address: DEAD_ADDRESS },
      ])
      const protectedAddressSet = buildProtectedAddressSet(protectedAddressEntries, isAddress)
      const blacklistAddresses = form.formValues.blacklistEnabled ? splitAddressList(form.formValues.initialBlacklist) : []
      const whitelistAddresses = form.formValues.whitelistEnabled ? splitAddressList(form.formValues.initialWhitelist) : []
      const invalidProtectedBlacklist = findProtectedAddresses(blacklistAddresses, protectedAddressSet)
      const invalidProtectedWhitelist = findProtectedAddresses(whitelistAddresses, protectedAddressSet)

      if (invalidProtectedBlacklist.length > 0) {
        message.warning(
          t('tokenDividendCreation.errors.protectedAddressSubmitError', {
            mode: t('tokenDividendCreation.fields.blacklistEnabled'),
            addresses: invalidProtectedBlacklist.join(', '),
          }),
        )
        return
      }

      if (invalidProtectedWhitelist.length > 0) {
        message.warning(
          t('tokenDividendCreation.errors.protectedAddressSubmitError', {
            mode: t('tokenDividendCreation.fields.whitelistEnabled'),
            addresses: invalidProtectedWhitelist.join(', '),
          }),
        )
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
    faqStructuredData,
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
  const faqVars = getTokenDividendFaqVars(chainDefinition, chainLabel)
  const faqStructuredData = buildTokenDividendFaqStructuredData(t, faqVars)

  const model: TokenDividendViewModel = {
    chainDefinition,
    connectedAddress: '',
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
    manageConsoleUrl: undefined,
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
    faqStructuredData,
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
  faqStructuredData,
}: {
  seo: ReturnType<typeof getPageSeo>
  model: TokenDividendViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenDividendViewModel['chainDefinition']
  hasThemeQuery: boolean
  faqStructuredData: ReturnType<typeof buildTokenDividendFaqStructuredData>
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
            {hasThemeQuery ? null : (
              <StructuredData id="token-dividend-creation-faq" data={faqStructuredData} />
            )}
            <div id="token-dividend-creation-form">
              <TokenDividendFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenDividendOverviewCard chainDefinition={chainDefinition} t={t} />
              <TokenDividendNextSteps t={t} />
              <TokenDividendSeoContent chainDefinition={chainDefinition} t={t} />
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

function buildTokenManageUrl(
  lang: string,
  chain: string,
  theme: string,
  themeColor: string,
  tokenAddress: string,
) {
  const basePath = buildPagePath(lang as never, chain as never, 'token-manage', {
    theme: theme as never,
    themeColor: themeColor as never,
  })
  const separator = basePath.includes('?') ? '&' : '?'
  return `${basePath}${separator}address=${encodeURIComponent(tokenAddress)}`
}
