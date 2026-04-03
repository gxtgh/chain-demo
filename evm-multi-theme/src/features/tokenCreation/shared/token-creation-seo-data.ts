import type { ChainDefinition } from '@/config/chains'

export type TokenCreationFaqKey = 'noCode' | 'fee' | 'standard' | 'trade' | 'decimals' | 'chainChoice'

export const tokenCreationFaqKeys: TokenCreationFaqKey[] = ['noCode', 'fee', 'standard', 'trade', 'decimals', 'chainChoice']

export function getTokenCreationFaqVars(chainDefinition: ChainDefinition, chainLabel: string) {
  return {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }
}

export function buildTokenCreationFaqStructuredData(
  t: (key: string, vars?: Record<string, string | number>) => string,
  vars: Record<string, string | number>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tokenCreationFaqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`tokenCreation.seoBody.faq.${key}.question`, vars),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`tokenCreation.seoBody.faq.${key}.answer`, vars),
      },
    })),
  }
}
