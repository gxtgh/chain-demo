import type { ChainDefinition } from '@/config/chains'

export type TokenTaxFaqKey = 'noCode' | 'fee' | 'template' | 'receiver' | 'poolToken' | 'liquidity'

export const tokenTaxFaqKeys: TokenTaxFaqKey[] = ['noCode', 'fee', 'template', 'receiver', 'poolToken', 'liquidity']

export function getTokenTaxFaqVars(chainDefinition: ChainDefinition, chainLabel: string) {
  return {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }
}

export function buildTokenTaxFaqStructuredData(
  t: (key: string, vars?: Record<string, string | number>) => string,
  vars: Record<string, string | number>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tokenTaxFaqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`tokenTaxCreation.seoBody.faq.${key}.question`, vars),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`tokenTaxCreation.seoBody.faq.${key}.answer`, vars),
      },
    })),
  }
}
