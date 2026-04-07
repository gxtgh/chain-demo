import type { SVGProps } from 'react'
import { GlobalOutlined } from '@ant-design/icons'

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function ChainIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
      <path d="M5 7l7 4 7-4" />
      <path d="M12 11v10" />
    </BaseIcon>
  )
}

export function LanguageIcon() {
  return (
    <GlobalOutlined />
  )
}

export function ThemeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 109 9c0-.3-.2-.5-.5-.5A7.5 7.5 0 0112.5 4c0-.3-.2-.5-.5-.5z" />
    </BaseIcon>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5" />
      <path d="M12 19v2.5" />
      <path d="M4.9 4.9l1.8 1.8" />
      <path d="M17.3 17.3l1.8 1.8" />
      <path d="M2.5 12H5" />
      <path d="M19 12h2.5" />
      <path d="M4.9 19.1l1.8-1.8" />
      <path d="M17.3 6.7l1.8-1.8" />
    </BaseIcon>
  )
}

export function PaletteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4a8 8 0 100 16h1a2 2 0 000-4h-1a2 2 0 010-4h5a3 3 0 003-3 5 5 0 00-5-5h-3z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="10" cy="7.5" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </BaseIcon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </BaseIcon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 00-.08-1l2.05-1.6-2-3.46-2.48.77a7 7 0 00-1.73-1L14.4 2h-4.8l-.36 2.71a7 7 0 00-1.73 1l-2.48-.77-2 3.46L5.08 11a7 7 0 000 2l-2.05 1.6 2 3.46 2.48-.77a7 7 0 001.73 1L9.6 22h4.8l.36-2.71a7 7 0 001.73-1l2.48.77 2-3.46L18.92 13c.05-.33.08-.66.08-1z" />
    </BaseIcon>
  )
}

export function MoreIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </BaseIcon>
  )
}

export function ShareIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.25 10.9l7.5-4.7" />
      <path d="M8.25 13.1l7.5 4.7" />
    </BaseIcon>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </BaseIcon>
  )
}
