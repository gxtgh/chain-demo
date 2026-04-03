import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { PageSeo } from '@/components/common/page-seo'
import { useRouteContext } from '@/app/use-route-context'
import { getChainFullName } from '@/config/chains'
import { getPageSeo } from '@/config/seo'
import type { TokenDisplayItem } from '@/components/common/token-display'
import {
  buildPoolTokenOptions,
  getTaxExchangeOptions,
  mergeTokenOptions,
  type TokenTaxSubmitValues,
  type TokenTaxViewModel,
} from '../business/model'
import { useTokenTaxForm } from '../business/useTokenTaxForm'
import { useTokenTaxSubmit } from '../business/useTokenTaxSubmit'
import { TokenTaxFormPanel } from './token-tax-form-panel'
import { TokenTaxOverviewCard } from './token-tax-overview-card'
import '@/features/tokenCreation/styles.scss'
import '../styles.scss'

export function TokenTaxCreationPage() {
  const { t, themeColor, chainDefinition } = useRouteContext()
  const form = useTokenTaxForm(chainDefinition, t)
  const exchanges = useMemo(() => getTaxExchangeOptions(chainDefinition), [chainDefinition])
  const [poolTokens, setPoolTokens] = useState<TokenDisplayItem[]>(() => buildPoolTokenOptions(chainDefinition))
  const submit = useTokenTaxSubmit(chainDefinition, form.formValues.exchange, t, () => form.isValid)
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('tax-token-creation', {
    t,
    chainName: chainLabel,
    nativeSymbol: chainDefinition.nativeToken.symbol,
    tokenType: chainDefinition.tokenType,
  })

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

      const { name, symbol, totalSupply, decimals, isSetTax, buyTax, sellTax, taxFeeReceiveAddress, exchange, poolToken } = form.formValues
      if (decimals == null) {
        return
      }

      const submitValues: TokenTaxSubmitValues = {
        name,
        symbol,
        totalSupply,
        decimals,
        isSetTax,
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

  const header = (
    <>
      <PageSeo {...seo} />
      <PageHeader
        eyebrow={t('tokenTaxCreation.eyebrow')}
        title={t('tokenTaxCreation.title')}
        description={t('tokenTaxCreation.description', {
          chain: chainLabel,
          tokenType: chainDefinition.tokenType,
        })}
      />
    </>
  )

  return (
    <section className={`page-stack token-creation-page token-tax-creation-page token-creation-${themeColor}`}>
      <div className="hero-banner">{header}</div>
      <div className="theme-single-column">
        <div className="theme-main theme-main-centered">
          <div className="token-creation-stack">
            <TokenTaxFormPanel model={model} />
            <TokenTaxOverviewCard chainDefinition={chainDefinition} t={t} />
          </div>
        </div>
      </div>
    </section>
  )
}
