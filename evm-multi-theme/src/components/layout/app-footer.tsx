import { useRouteContext } from '@/app/use-route-context'

export function AppFooter() {
  const { t } = useRouteContext()

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <strong>Web3 Token</strong>
          <span>{t('footer.copyright')}</span>
        </div>
        <a className="app-footer-email" href="mailto:support@create-solana-token.com">
          <span>{t('footer.emailLabel')}:</span>
          <strong>support@create-solana-token.com</strong>
        </a>
      </div>
    </footer>
  )
}
