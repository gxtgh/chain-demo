import type { SVGProps } from 'react'

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

export function LanguageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h9" />
      <path d="M8.5 6c0 6-2.5 10-4.5 12" />
      <path d="M8.5 6c0 4.3 2.1 8.1 5.5 12" />
      <path d="M14 18h6" />
      <path d="M17 6l3 12" />
      <path d="M17 6l-3 12" />
    </BaseIcon>
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
