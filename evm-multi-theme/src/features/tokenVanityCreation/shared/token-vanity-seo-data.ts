import type { ChainDefinition } from '@/config/chains'

export type TokenVanityFaqKey = 'what' | 'whyGenerate' | 'whyRegenerate' | 'security' | 'time' | 'deploy'

export const tokenVanityFaqKeys: TokenVanityFaqKey[] = ['what', 'whyGenerate', 'whyRegenerate', 'security', 'time', 'deploy']

export function getTokenVanityFaqVars(chainDefinition: ChainDefinition, chainLabel: string) {
  return {
    chain: chainLabel,
    tokenType: chainDefinition.tokenType,
    symbol: chainDefinition.nativeToken.symbol,
  }
}

export function buildTokenVanityFaqStructuredData(
  t: (key: string, vars?: Record<string, string | number>) => string,
  vars: Record<string, string | number>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tokenVanityFaqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`tokenVanityCreation.seoBody.faq.${key}.question`, vars),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`tokenVanityCreation.seoBody.faq.${key}.answer`, vars),
      },
    })),
  }
}
