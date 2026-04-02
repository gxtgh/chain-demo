import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons'
import { AppModal } from '@/components/common/modal'
import './styles.scss'

type Step = {
  id: number
  text: string
  errorText?: string
}

type CurrentStep = {
  id: number
  status: 'loading' | 'success' | 'failed'
} | null

export function OperationStatus({
  width = 440,
  title,
  steps,
  step,
  tipsText,
  open,
  cancelBtnShow = true,
  onClose,
}: {
  width?: number
  title: string
  steps: Step[]
  step: CurrentStep
  tipsText?: string
  open: boolean
  cancelBtnShow?: boolean
  onClose?: () => void
}) {
  function getStepStatus(stepId: number) {
    if (!step) return 'default'
    if (stepId === step.id) return step.status
    if (stepId < step.id) return 'success'
    return 'default'
  }

  function getStepText(stepItem: Step) {
    if (!step) return stepItem.text
    if (stepItem.id === step.id && step.status === 'failed') {
      return stepItem.errorText ?? stepItem.text
    }
    return stepItem.text
  }

  const progressValue = step ? `${Math.min(step.id, steps.length)}/${steps.length}` : `0/${steps.length}`

  return (
    <AppModal
      className="operation-status-modal"
      closable={cancelBtnShow}
      footer={null}
      onCancel={onClose}
      open={open}
      title={
        <div className="operation-status-title">
          <div className="operation-status-title-copy">
            <span className="operation-status-title-text">{title}</span>
          </div>
          <span className={`operation-status-pill ${step?.status ?? 'default'}`}>{progressValue}</span>
        </div>
      }
      width={width}
    >
      {tipsText ? <div className="operation-status-tips">{tipsText}</div> : null}
      <ul className="operation-status-list">
        {steps.map((item, index) => {
          const currentStatus = getStepStatus(item.id)
          return (
            <li className={`operation-status-item ${currentStatus}`} key={item.id}>
              <div className="operation-status-main">
                <span className="operation-status-index">{index + 1}</span>
                <span className="operation-status-text">{getStepText(item)}</span>
              </div>
              <span className={`operation-status-icon ${currentStatus}`}>
                {currentStatus === 'loading' ? <LoadingOutlined /> : null}
                {currentStatus === 'success' ? <CheckCircleFilled /> : null}
                {currentStatus === 'failed' ? <CloseCircleFilled /> : null}
              </span>
            </li>
          )
        })}
      </ul>
    </AppModal>
  )
}
