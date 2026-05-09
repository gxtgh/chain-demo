import {
  FileSearchOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

type TokenSimpleControlNextStepsProps = {
  t: (key: string, vars?: Record<string, string | number>) => string
}

type StepKey = 'addWallet' | 'reviewPermissions' | 'configureLists' | 'metadata'

const stepIcons: Record<StepKey, ReactNode> = {
  addWallet: <WalletOutlined />,
  reviewPermissions: <FileSearchOutlined />,
  configureLists: <SettingOutlined />,
  metadata: <InfoCircleOutlined />,
}

export function TokenSimpleControlNextSteps({ t }: TokenSimpleControlNextStepsProps) {
  const steps: StepKey[] = ['addWallet', 'reviewPermissions', 'configureLists', 'metadata']

  return (
    <section className="token-success-section token-next-steps-section">
      <div className="token-success-copy">
        <h3>{t('tokenSimpleControlCreation.nextSteps.title')}</h3>
        <p>{t('tokenSimpleControlCreation.nextSteps.description')}</p>
        <div className="next-steps-note">
          <InfoCircleOutlined />
          <span>{t('tokenSimpleControlCreation.nextSteps.note')}</span>
        </div>
      </div>

      <div className="next-step-grid">
        {steps.map((step, index) => (
          <article className="next-step-card" key={step}>
            <div className="next-step-card-head">
              <div className="next-step-icon">{stepIcons[step]}</div>
              <div className="next-step-heading">
                <span className="next-step-index">{String(index + 1).padStart(2, '0')}</span>
                <h4>{t(`tokenSimpleControlCreation.nextSteps.${step}.title`)}</h4>
              </div>
            </div>
            <p>{t(`tokenSimpleControlCreation.nextSteps.${step}.description`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
