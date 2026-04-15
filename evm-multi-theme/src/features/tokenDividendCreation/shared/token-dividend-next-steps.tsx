const stepKeys = ['importWallet', 'addLiquidity', 'openConsole', 'verifyRoute'] as const

export function TokenDividendNextSteps({
  t,
}: {
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  return (
    <section className="token-next-steps-section">
      <div className="token-section-copy">
        <h3>{t('tokenDividendCreation.nextSteps.title')}</h3>
        <p>{t('tokenDividendCreation.nextSteps.description')}</p>
      </div>

      <div className="token-next-step-grid">
        {stepKeys.map((key) => (
          <article className="token-next-step-card" key={key}>
            <div className="token-next-step-index">{String(stepKeys.indexOf(key) + 1).padStart(2, '0')}</div>
            <div className="token-next-step-copy">
              <h4>{t(`tokenDividendCreation.nextSteps.${key}.title`)}</h4>
              <p>{t(`tokenDividendCreation.nextSteps.${key}.description`)}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="token-next-steps-note">{t('tokenDividendCreation.nextSteps.note')}</p>
    </section>
  )
}
