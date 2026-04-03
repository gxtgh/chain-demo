import {
  FileSearchOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

type TokenTaxNextStepsProps = {
  t: (key: string, vars?: Record<string, string | number>) => string
}

type StepKey = 'addWallet' | 'verifyFees' | 'reviewPairing' | 'metadata'

const stepIcons: Record<StepKey, ReactNode> = {
  addWallet: <WalletOutlined />,
  verifyFees: <FileSearchOutlined />,
  reviewPairing: <InfoCircleOutlined />,
  metadata: <PictureOutlined />,
}

export function TokenTaxNextSteps({ t }: TokenTaxNextStepsProps) {
  const steps: StepKey[] = ['addWallet', 'verifyFees', 'reviewPairing', 'metadata']

  return (
    <section className="token-success-section token-next-steps-section">
      <div className="token-success-copy">
        <h3>{t('tokenTaxCreation.nextSteps.title')}</h3>
        <p>{t('tokenTaxCreation.nextSteps.description')}</p>
        <div className="next-steps-note">
          <InfoCircleOutlined />
          <span>{t('tokenTaxCreation.nextSteps.note')}</span>
        </div>
      </div>

      <div className="next-step-grid">
        {steps.map((step, index) => (
          <article className="next-step-card" key={step}>
            <div className="next-step-card-head">
              <div className="next-step-icon">{stepIcons[step]}</div>
              <div className="next-step-heading">
                <span className="next-step-index">{String(index + 1).padStart(2, '0')}</span>
                <h4>{t(`tokenTaxCreation.nextSteps.${step}.title`)}</h4>
              </div>
            </div>
            <p>{t(`tokenTaxCreation.nextSteps.${step}.description`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
