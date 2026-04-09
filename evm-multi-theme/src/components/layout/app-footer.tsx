import { useRouteContext } from '@/app/use-route-context'
import { SUPPORT_EMAIL } from '@/config/site'

export function AppFooter() {
  const { t } = useRouteContext()

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          {/* <strong>LaunchLayer</strong> */}
          <span>{t('footer.copyright')}</span>
        </div>
        <a className="app-footer-email" href={`mailto:${SUPPORT_EMAIL}`}>
          <span>{t('footer.emailLabel')}:</span>
          <strong>{SUPPORT_EMAIL}</strong>
        </a>
      </div>
    </footer>
  )
}
