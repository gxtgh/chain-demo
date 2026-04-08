import {
  DeploymentUnitOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

type TokenVanityNextStepsProps = {
  t: (key: string, vars?: Record<string, string | number>) => string
}

type StepKey = 'addWallet' | 'verifyAddress' | 'addLiquidity' | 'metadata'

const stepIcons: Record<StepKey, ReactNode> = {
  addWallet: <WalletOutlined />,
  verifyAddress: <FileSearchOutlined />,
  addLiquidity: <DeploymentUnitOutlined />,
  metadata: <PictureOutlined />,
}

export function TokenVanityNextSteps({ t }: TokenVanityNextStepsProps) {
  const steps: StepKey[] = ['addWallet', 'verifyAddress', 'addLiquidity', 'metadata']

  return (
    <section className="token-success-section token-next-steps-section">
      <div className="token-success-copy">
        <h3>{t('tokenVanityCreation.nextSteps.title')}</h3>
        <p>{t('tokenVanityCreation.nextSteps.description')}</p>
        <div className="next-steps-note">
          <InfoCircleOutlined />
          <span>{t('tokenVanityCreation.nextSteps.note')}</span>
        </div>
      </div>

      <div className="next-step-grid">
        {steps.map((step, index) => (
          <article className="next-step-card" key={step}>
            <div className="next-step-card-head">
              <div className="next-step-icon">{stepIcons[step]}</div>
              <div className="next-step-heading">
                <span className="next-step-index">{String(index + 1).padStart(2, '0')}</span>
                <h4>{t(`tokenVanityCreation.nextSteps.${step}.title`)}</h4>
              </div>
            </div>
            <p>{t(`tokenVanityCreation.nextSteps.${step}.description`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
