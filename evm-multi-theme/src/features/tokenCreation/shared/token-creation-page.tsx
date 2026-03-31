import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { useRouteContext } from '@/app/use-route-context'
import { getPageSeo } from '@/config/seo'
import { useTokenCreationForm } from '../business/useTokenCreationForm'
import { useTokenCreationSubmit } from '../business/useTokenCreationSubmit'
import type { TokenCreationViewModel } from '../business/types'
import { TokenCreationThemePage1 } from '../theme/page1'
import { TokenCreationThemePage2 } from '../theme/page2'
import { TokenCreationThemePage3 } from '../theme/page3'

export function TokenCreationPage() {
  const { t, themeColor, chainDefinition } = useRouteContext()
  const form = useTokenCreationForm(t)
  const submit = useTokenCreationSubmit(chainDefinition, t, () => form.isValid)
  const seo = getPageSeo('token-creation', {
    t,
    chainName: chainDefinition.name,
    nativeSymbol: chainDefinition.nativeSymbol,
    tokenType: chainDefinition.tokenType,
  })

  const model: TokenCreationViewModel = {
    chainDefinition,
    formValues: form.formValues,
    errors: form.errors,
    updateField: form.updateField,
    creationFee: submit.creationFee,
    feeLoading: submit.feeLoading,
    attemptCount: submit.attemptCount,
    submitPhase: submit.submitPhase,
    submitError: submit.submitError,
    result: submit.result,
    onSubmit: async () => {
      form.markSubmitted()
      if (!form.isValid) {
        return
      }
      await submit.submit(form.formValues)
    },
    resetSubmitState: submit.resetSubmitState,
    hasSubmitted: form.hasSubmitted,
    t,
  }

  const header = (
    <>
      <PageSeo {...seo} />
      <PageHeader
        eyebrow={t('tokenCreation.eyebrow')}
        title={t('tokenCreation.title')}
        description={t('tokenCreation.description', {
          symbol: chainDefinition.name,
          tokenType: chainDefinition.tokenType,
        })}
      />
    </>
  )

  if (themeColor === 'purple') {
    return <TokenCreationThemePage2 header={header} model={model} />
  }

  if (themeColor === 'green') {
    return <TokenCreationThemePage3 header={header} model={model} />
  }

  return <TokenCreationThemePage1 header={header} model={model} />
}
