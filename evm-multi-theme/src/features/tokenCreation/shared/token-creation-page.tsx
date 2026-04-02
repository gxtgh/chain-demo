import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import type { TokenCreationSubmitValues, TokenCreationViewModel } from '../business/model'
import { useTokenCreationForm } from '../business/useTokenCreationForm'
import { useTokenCreationSubmit } from '../business/useTokenCreationSubmit'
import { TokenCreationFormPanel } from './token-creation-form-panel'
import { TokenPermissionCard } from './token-permission-card'
import '../styles.scss'

export function TokenCreationPage() {
  const { t, themeColor, chainDefinition } = useRouteContext()
  const form = useTokenCreationForm(t)
  const submit = useTokenCreationSubmit(chainDefinition, t, () => form.isValid)
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('token-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })

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
      <PageSeo {...seo} />
      <PageHeader
        eyebrow={t('tokenCreation.eyebrow')}
        title={t('tokenCreation.title')}
        description={t('tokenCreation.description', {
          symbol: chainLabel,
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
            <TokenCreationFormPanel model={model} />
            <TokenPermissionCard chainDefinition={chainDefinition} t={t} />
          </div>
        </div>
      </div>
    </section>
  )
}
