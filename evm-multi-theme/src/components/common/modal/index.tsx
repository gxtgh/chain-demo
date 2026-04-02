import type { ReactNode } from 'react'
import { Modal, type ModalProps } from 'antd'
import './styles.scss'

type AppModalProps = Omit<ModalProps, 'footer' | 'title'> & {
  title?: ReactNode
  footer?: ReactNode | null
  footerClassName?: string
}

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

export function AppModal({
  className,
  title,
  footer = null,
  footerClassName,
  centered,
  maskClosable,
  width,
  ...props
}: AppModalProps) {
  return (
    <Modal
      {...props}
      className={joinClassNames('app-modal', className)}
      centered={centered ?? true}
      footer={
        footer === null ? null : <div className={joinClassNames('app-modal-footer-layout', footerClassName)}>{footer}</div>
      }
      maskClosable={maskClosable ?? false}
      title={title}
      width={width ?? 520}
    />
  )
}
