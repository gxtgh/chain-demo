import { ExclamationCircleFilled } from '@ant-design/icons'
import type { ReactNode } from 'react'
import { AppModal } from '@/components/common/modal'
import './styles.scss'

export function OperationWarning({
  open,
  title,
  description,
  labelText,
  contents,
  noteText,
  footer,
  onClose,
}: {
  open: boolean
  title: ReactNode
  description?: ReactNode
  labelText: string
  contents: string[]
  noteText?: ReactNode
  footer?: ReactNode
  onClose?: () => void
}) {
  return (
    <AppModal
      className="operation-warning-modal"
      footer={footer}
      onCancel={onClose}
      open={open}
      title={
        <div className="operation-warning-title">
          <span className="operation-warning-icon" aria-hidden="true">
            <ExclamationCircleFilled />
          </span>
          <div className="operation-warning-title-copy">
            <span className="operation-warning-title-text">{title}</span>
            {description ? <span className="operation-warning-description">{description}</span> : null}
          </div>
        </div>
      }
      width={520}
    >
      <div className="operation-warning-body">
        <p className="operation-warning-label">{labelText}</p>
        <ol className="operation-warning-list">
          {contents.map((item, index) => (
            <li className="operation-warning-item" key={`${index}-${item}`}>
              <span className="operation-warning-item-index">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        {noteText ? <p className="operation-warning-note">{noteText}</p> : null}
      </div>
    </AppModal>
  )
}
