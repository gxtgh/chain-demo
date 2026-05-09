import { useAccount } from 'wagmi'
import { useRenderMode } from '@/app/render-mode'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import {
  defaultTokenSimpleControlValues,
  type TokenSimpleControlSubmitValues,
  type TokenSimpleControlViewModel,
} from '../business/model'
import { useTokenSimpleControlForm } from '../business/useTokenSimpleControlForm'
import { useTokenSimpleControlSubmit } from '../business/useTokenSimpleControlSubmit'
import { TokenSimpleControlFormPanel } from './token-simple-control-form-panel'
import { TokenSimpleControlNextSteps } from './token-simple-control-next-steps'
import { TokenSimpleControlOverviewCard } from './token-simple-control-overview-card'
import '@/features/tokenCreation/styles.scss'
import '../styles.scss'

export function TokenSimpleControlCreationPage() {
  const mode = useRenderMode()
  if (mode === 'static') {
    return <StaticTokenSimpleControlCreationPage />
  }

  return <InteractiveTokenSimpleControlCreationPage />
}

function InteractiveTokenSimpleControlCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const { address } = useAccount()
  const chainLabel = getChainFullName(chainDefinition)
  const form = useTokenSimpleControlForm(t)
  const submit = useTokenSimpleControlSubmit(chainDefinition, t, () => form.isValid)
  const seo = getPageSeo('token-simple-control-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })

  const model: TokenSimpleControlViewModel = {
    chainDefinition,
    connectedAddress: address ?? '',
    formValues: form.formValues,
    errors: form.errors,
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
    onUseConnectedAddress: () => {
      if (!address) return
      form.updateField('receiveAddress', address)
      submit.clearResult()
    },
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid || form.formValues.decimals == null) {
        return
      }

      const submitValues: TokenSimpleControlSubmitValues = {
        ...form.formValues,
        decimals: form.formValues.decimals,
      }

      await submit.submit(submitValues)
    },
    onCancelFlow: submit.cancelFlow,
    onCloseSuccessModal: submit.closeSuccessModal,
    onCloseFailureModal: submit.closeFailureModal,
    onClearResult: submit.clearResult,
    t,
  }

  return renderTokenSimpleControlCreationLayout({
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

function StaticTokenSimpleControlCreationPage() {
  const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-simple-control-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })

  const model: TokenSimpleControlViewModel = {
    chainDefinition,
    connectedAddress: '',
    formValues: defaultTokenSimpleControlValues,
    errors: {},
    creationFee: null,
    feeLoading: true,
    loading: false,
    submitStep: null,
    result: null,
    successModalOpen: false,
    failureModalOpen: false,
    updateField: createStaticUpdateField,
    onUseConnectedAddress: () => undefined,
    onSubmit: async () => undefined,
    onCancelFlow: () => undefined,
    onCloseSuccessModal: () => undefined,
    onCloseFailureModal: () => undefined,
    onClearResult: () => undefined,
    t,
  }

  return renderTokenSimpleControlCreationLayout({
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

function renderTokenSimpleControlCreationLayout({
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
  model: TokenSimpleControlViewModel
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: string
  chain: string
  themeColor: string
  chainDefinition: TokenSimpleControlViewModel['chainDefinition']
  hasThemeQuery: boolean
}) {
  const chainLabel = getChainFullName(chainDefinition)
  const header = (
    <PageHeader
      eyebrow={t('tokenSimpleControlCreation.eyebrow')}
      title={t('tokenSimpleControlCreation.title')}
      description={t('tokenSimpleControlCreation.description', {
        chain: chainLabel,
        tokenType: chainDefinition.tokenType,
      })}
    />
  )

  return (
    <section className={`page-stack token-creation-page token-simple-control-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <PageSeo
              {...seo}
              canonicalUrl={buildCanonicalPageUrl(lang as never, chain as never, 'token-simple-control-creation')}
              alternates={buildAlternatePageLinks(chain as never, 'token-simple-control-creation')}
              locale={normalizeLocaleTag(lang as never)}
              robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
            />
            <div id="token-simple-control-creation-form">
              <TokenSimpleControlFormPanel model={model} />
            </div>
            <section className="surface-card token-creation-content-module">
              <TokenSimpleControlOverviewCard chainDefinition={chainDefinition} t={t} />
              <TokenSimpleControlNextSteps t={t} />
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
