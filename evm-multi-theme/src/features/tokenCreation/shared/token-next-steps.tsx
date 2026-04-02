import {
  DeploymentUnitOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  PictureOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

type TokenNextStepsProps = {
  t: (key: string, vars?: Record<string, string | number>) => string
}

type StepKey = 'addWallet' | 'addLiquidity' | 'goLive' | 'metadata'

const stepIcons: Record<StepKey, ReactNode> = {
  addWallet: <WalletOutlined />,
  addLiquidity: <DeploymentUnitOutlined />,
  goLive: <LineChartOutlined />,
  metadata: <PictureOutlined />,
}

export function TokenNextSteps({ t }: TokenNextStepsProps) {
  const steps: StepKey[] = ['addWallet', 'addLiquidity', 'goLive', 'metadata']

  return (
    <section className="token-success-section token-next-steps-section">
      <div className="token-success-copy">
        <h3>{t('tokenCreation.nextSteps.title')}</h3>
        <p>{t('tokenCreation.nextSteps.description')}</p>
      </div>

      <div className="next-step-grid">
        {steps.map((step, index) => (
          <article className="next-step-card" key={step}>
            <div className="next-step-card-head">
              <div className="next-step-icon">{stepIcons[step]}</div>
              <div className="next-step-heading">
                <span className="next-step-index">{String(index + 1).padStart(2, '0')}</span>
                <h4>{t(`tokenCreation.nextSteps.${step}.title`)}</h4>
              </div>
            </div>
            <p>{t(`tokenCreation.nextSteps.${step}.description`)}</p>
            <span className="next-step-hint">{t(`tokenCreation.nextSteps.${step}.action`)}</span>
          </article>
        ))}
      </div>

      <div className="next-steps-note">
        <InfoCircleOutlined />
        <span>{t('tokenCreation.nextSteps.note')}</span>
      </div>
    </section>
  )
}
