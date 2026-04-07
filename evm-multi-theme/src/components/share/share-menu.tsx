import { MoreIcon, ShareIcon } from '@/components/common/topbar-icons'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { useRouteContext } from '@/app/use-route-context'

type ShareMenuProps = {
  className?: string
  onShare: () => void
  showValue?: boolean
}

export function ShareMenu({ className, onShare, showValue = true }: ShareMenuProps) {
  const { t } = useRouteContext()

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.more')}
      className={className}
      icon={<MoreIcon />}
      onChange={(key) => {
        if (key === 'share') {
          onShare()
        }
      }}
      options={[
        {
          key: 'share',
          label: t('share.menuItem'),
          prefix: <ShareIcon />,
        },
      ]}
      showValue={showValue}
      value="more"
    />
  )
}
