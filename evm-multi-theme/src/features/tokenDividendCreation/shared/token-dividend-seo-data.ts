import type { ChainDefinition } from '@/config/chains'

export type TokenDividendFaqKey =
  | 'noCode'
  | 'rewardMode'
  | 'taxFlow'
  | 'holdingThreshold'
  | 'liquidity'
  | 'management'
  | 'externalReward'

export const tokenDividendFaqKeys: TokenDividendFaqKey[] = [
  'noCode',
  'rewardMode',
  'taxFlow',
  'holdingThreshold',
  'liquidity',
  'management',
  'externalReward',
]

export function getTokenDividendFaqVars(chainDefinition: ChainDefinition, chainLabel: string) {
  return {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }
}

export function buildTokenDividendFaqStructuredData(
  t: (key: string, vars?: Record<string, string | number>) => string,
  vars: Record<string, string | number>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tokenDividendFaqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`tokenDividendCreation.seoBody.faq.${key}.question`, vars),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`tokenDividendCreation.seoBody.faq.${key}.answer`, vars),
      },
    })),
  }
}
