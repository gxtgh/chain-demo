import {
  ApartmentOutlined,
  ControlOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

type StepKey = 'importWallet' | 'addLiquidity' | 'openConsole' | 'verifyRoute'

const stepKeys: StepKey[] = ['importWallet', 'addLiquidity', 'openConsole', 'verifyRoute']
const stepIcons: Record<StepKey, ReactNode> = {
  importWallet: <WalletOutlined />,
  addLiquidity: <ApartmentOutlined />,
  openConsole: <ControlOutlined />,
  verifyRoute: <FileSearchOutlined />,
}

export function TokenDividendNextSteps({
  t,
}: {
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  return (
    <section className="token-success-section token-next-steps-section">
      <div className="token-success-copy">
        <h3>{t('tokenDividendCreation.nextSteps.title')}</h3>
        <p>{t('tokenDividendCreation.nextSteps.description')}</p>
        <div className="next-steps-note">
          <InfoCircleOutlined />
          <span>{t('tokenDividendCreation.nextSteps.note')}</span>
        </div>
      </div>

      <div className="next-step-grid">
        {stepKeys.map((key, index) => (
          <article className="next-step-card" key={key}>
            <div className="next-step-card-head">
              <div className="next-step-icon">{stepIcons[key]}</div>
              <div className="next-step-heading">
                <span className="next-step-index">{String(index + 1).padStart(2, '0')}</span>
                <h4>{t(`tokenDividendCreation.nextSteps.${key}.title`)}</h4>
              </div>
            </div>
            <p>{t(`tokenDividendCreation.nextSteps.${key}.description`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
