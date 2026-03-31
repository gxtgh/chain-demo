import { useAccount } from 'wagmi'
import type { TokenCreationViewModel } from '../business/types'

export function TokenCreationStatusPanel({ model }: { model: TokenCreationViewModel }) {
  const { address } = useAccount()
  const { t, chainDefinition, submitPhase, submitError, result } = model

  const statusMessage =
    submitPhase === 'loading_fee'
      ? t('tokenCreation.status.loadingFee')
      : submitPhase === 'waiting_wallet'
        ? t('tokenCreation.status.waitingWallet')
        : submitPhase === 'pending'
          ? t('tokenCreation.status.pending')
          : submitPhase === 'success'
            ? t('tokenCreation.status.success')
            : t('tokenCreation.status.idle')

  return (
    <section className="surface-card">
      <div className="summary-list">
        <div className="summary-row">
          <span>{t('tokenCreation.labels.factory')}</span>
          <strong>{chainDefinition.factoryAddress}</strong>
        </div>
        <div className="summary-row">
          <span>{t('tokenCreation.labels.walletAddress')}</span>
          <strong>{address ?? '--'}</strong>
        </div>
        <div className="summary-row">
          <span>{t('acceptance.labels.status')}</span>
          <strong>{statusMessage}</strong>
        </div>
      </div>

      <div className={`state-banner ${submitPhase}`}>{submitError || statusMessage}</div>

      {result ? (
        <div className="result-card">
          <h3>{t('tokenCreation.success.title')}</h3>
          <div className="summary-list compact">
            <div className="summary-row">
              <span>{t('tokenCreation.success.txHash')}</span>
              <strong>{result.txHash}</strong>
            </div>
            <div className="summary-row">
              <span>{t('tokenCreation.success.tokenAddress')}</span>
              <strong>{result.tokenAddress ?? '--'}</strong>
            </div>
          </div>
          <a className="text-link" href={result.explorerUrl} target="_blank" rel="noreferrer">
            {t('tokenCreation.success.openExplorer')}
          </a>
        </div>
      ) : null}
    </section>
  )
}
