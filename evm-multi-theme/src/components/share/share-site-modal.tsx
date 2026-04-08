import { Button, QRCode, message } from 'antd'
import { useRef } from 'react'
import { AppModal } from '@/components/common/modal'
import { ShareIcon } from '@/components/common/topbar-icons'
import { useRouteContext } from '@/app/use-route-context'
import { supportedChains } from '@/config/chains'
import { SITE_URL, SUPPORT_EMAIL } from '@/config/site'
import './styles.scss'

type ShareSiteModalProps = {
  onClose: () => void
  open: boolean
}

export function ShareSiteModal({ onClose, open }: ShareSiteModalProps) {
  const { t, themeColor } = useRouteContext()
  const qrCodeRef = useRef<HTMLDivElement | null>(null)
  const sharePanelRef = useRef<HTMLElement | null>(null)
  const shareUrl = SITE_URL
  const featuredChains = supportedChains
    .filter((item) => ['bsc', 'eth', 'base', 'x-layer', 'polygon', 'arbitrum'].includes(item.key))
    .map((item) => item.name)
  const chainSummary = t('share.chainSummary', {
    chains: featuredChains.join(', '),
    count: supportedChains.length,
  })

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      message.success(t('share.copySuccess'))
    } catch {
      message.error(t('share.copyFailed'))
    }
  }

  async function saveScreenshot() {
    try {
      const imageBlob = await createElementScreenshot(sharePanelRef.current)
      downloadBlob(imageBlob, 'web3-token-screenshot.png')
      message.success(t('share.downloadSuccess'))
    } catch {
      message.error(t('share.downloadFailed'))
    }
  }

  return (
    <AppModal
      className="share-site-modal"
      maskClosable
      onCancel={onClose}
      open={open}
      title={null}
      width={1040}
      footer={
        <>
          <Button className="share-modal-close-button" onClick={onClose}>{t('share.close')}</Button>
          <Button className="share-modal-screenshot-button" onClick={() => void saveScreenshot()}>{t('share.downloadImage')}</Button>
          <Button className="share-modal-copy-button" type="primary" onClick={() => void copyShareLink()}>
            {t('share.copyLink')}
          </Button>
        </>
      }
    >
      <section className="share-site-panel" ref={sharePanelRef}>
        <div className="share-site-copy">
          <p className="share-site-eyebrow">{t('share.eyebrow')}</p>
          <h2>{t('share.title')}</h2>
          <p>{t('share.description')}</p>

          <div className="share-site-points">
            <span>{t('share.featureTokens')}</span>
            <span>{chainSummary}</span>
            <span>{t('share.featureNoCode')}</span>
          </div>

          <div className="share-site-link-card">
            <span>{t('share.shareLink')}</span>
            <strong>{shareUrl}</strong>
          </div>

          <div className="share-site-qr-card">
            <div className="share-site-qr-code" ref={qrCodeRef}>
              <QRCode bgColor="#ffffff" color="#17111f" size={116} type="svg" value={shareUrl} />
            </div>
            <div>
              <span>{t('share.qrTitle')}</span>
              <strong>{t('share.qrText')}</strong>
            </div>
          </div>
        </div>

        <div className={`share-site-visual share-site-visual-${themeColor}`}>
          <div aria-hidden="true" className="share-site-visual-grid" />
          <div aria-hidden="true" className="share-site-visual-glow" />
          <div className="share-orbit share-orbit-a" />
          <div className="share-orbit share-orbit-b" />
          <div className="share-hero-card share-hero-card-main">
            <div>
              <span>{t('share.visualLabel')}</span>
              <strong>{t('app.name')}</strong>
            </div>
            <ShareIcon />
          </div>
          <div className="share-hero-card share-hero-card-tools">
            <strong>{t('share.toolsTitle')}</strong>
            <span>{t('share.toolsText')}</span>
          </div>
          <div className="share-hero-card share-hero-card-chains">
            <strong>{t('share.chainsTitle')}</strong>
            <span>{featuredChains.join(' / ')}</span>
          </div>
          <div className="share-hero-card share-hero-card-email">
            <span>{t('share.support')}</span>
            <strong>{SUPPORT_EMAIL}</strong>
          </div>
        </div>
      </section>
    </AppModal>
  )
}

async function createElementScreenshot(element: HTMLElement | null) {
  if (!element) {
    throw new Error('Missing screenshot element.')
  }

  await document.fonts?.ready

  const backgroundSource = element.closest('.ant-modal-content')
  const canvas = await renderElementToCanvas(
    element,
    backgroundSource instanceof HTMLElement ? backgroundSource : null,
  )
  return await canvasToBlob(canvas)
}

async function renderElementToCanvas(element: HTMLElement, backgroundSource: HTMLElement | null) {
  const rect = element.getBoundingClientRect()
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const clonedElement = element.cloneNode(true) as HTMLElement

  inlineComputedStyles(element, clonedElement)
  stabilizeExportStyles(clonedElement)

  const exportPadding = 28
  const exportWidth = Math.ceil(rect.width + exportPadding * 2)
  const exportHeight = Math.ceil(rect.height + exportPadding * 2)
  const backgroundStyle = backgroundSource ? window.getComputedStyle(backgroundSource) : null
  const exportBackground = getExportBackgroundStyle(backgroundSource)

  const wrapper = document.createElement('div')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  wrapper.style.width = `${exportWidth}px`
  wrapper.style.height = `${exportHeight}px`
  wrapper.style.display = 'block'
  wrapper.style.boxSizing = 'border-box'
  wrapper.style.padding = `${exportPadding}px`
  wrapper.style.overflow = 'hidden'
  wrapper.style.background = exportBackground.background
  wrapper.style.backgroundColor = exportBackground.backgroundColor
  wrapper.style.borderRadius = backgroundStyle?.borderRadius || '28px'

  clonedElement.style.width = `${Math.ceil(rect.width)}px`
  clonedElement.style.height = `${Math.ceil(rect.height)}px`
  clonedElement.style.margin = '0'
  wrapper.appendChild(clonedElement)

  const serialized = new XMLSerializer().serializeToString(wrapper)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
      <foreignObject width="100%" height="100%">${serialized}</foreignObject>
    </svg>
  `

  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(exportWidth * scale)
  canvas.height = Math.ceil(exportHeight * scale)
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context unavailable.')
  }

  context.scale(scale, scale)
  context.drawImage(image, 0, 0, exportWidth, exportHeight)
  return canvas
}

function getExportBackgroundStyle(backgroundSource: HTMLElement | null) {
  const themeHost = document.body
  const themeStyle = window.getComputedStyle(themeHost)
  const backgroundStyle = backgroundSource ? window.getComputedStyle(backgroundSource) : null
  const themeAccent = themeStyle.getPropertyValue('--theme-accent').trim() || '#ff6b2d'
  const themeAccentStrong = themeStyle.getPropertyValue('--theme-accent-strong').trim() || '#ff9d67'
  const themeSurfaceStrong =
    themeStyle.getPropertyValue('--theme-surface-strong').trim() ||
    backgroundStyle?.backgroundColor ||
    'rgba(255, 255, 255, 0.96)'

  return {
    background: [
      `radial-gradient(circle at 18% 12%, ${withAlpha(themeAccent, 0.16)}, transparent 28%)`,
      `radial-gradient(circle at 82% 4%, ${withAlpha(themeAccentStrong, 0.12)}, transparent 26%)`,
      themeSurfaceStrong,
    ].join(', '),
    backgroundColor: themeSurfaceStrong,
  }
}

function withAlpha(color: string, alpha: number) {
  const normalized = color.trim()

  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1)
    const isShort = hex.length === 3
    const isLong = hex.length === 6

    if (!isShort && !isLong) {
      return normalized
    }

    const expanded = isShort
      ? hex.split('').map((char) => `${char}${char}`).join('')
      : hex
    const red = Number.parseInt(expanded.slice(0, 2), 16)
    const green = Number.parseInt(expanded.slice(2, 4), 16)
    const blue = Number.parseInt(expanded.slice(4, 6), 16)

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i)
  if (!rgbMatch) {
    return normalized
  }

  const [red = '255', green = '255', blue = '255'] = rgbMatch[1]
    .split(',')
    .map((part) => part.trim())

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function stabilizeExportStyles(root: HTMLElement) {
  const themeStyle = window.getComputedStyle(document.body)
  const isDark = document.body.classList.contains('app-theme-dark')
  const themeSurfaceStrong = themeStyle.getPropertyValue('--theme-surface-strong').trim() || 'rgba(255, 255, 255, 0.96)'
  const themeLine = themeStyle.getPropertyValue('--theme-line').trim() || 'rgba(76, 40, 20, 0.1)'
  const exportCardBackground = isDark ? themeSurfaceStrong : 'rgba(255, 255, 255, 0.96)'
  const exportCardShadow = isDark
    ? '0 24px 56px rgba(0, 0, 0, 0.34), 0 10px 24px rgba(0, 0, 0, 0.2)'
    : '0 18px 42px rgba(83, 45, 23, 0.08)'

  root.querySelectorAll<HTMLElement>('.share-hero-card').forEach((card) => {
    card.style.backdropFilter = 'none'
    card.style.setProperty('-webkit-backdrop-filter', 'none')
    card.style.backgroundColor = exportCardBackground
    card.style.backgroundImage = 'none'
    card.style.borderColor = themeLine
    card.style.boxShadow = exportCardShadow
  })
}

function inlineComputedStyles(source: Element, target: Element) {
  const sourceElements = [source, ...Array.from(source.querySelectorAll('*'))]
  const targetElements = [target, ...Array.from(target.querySelectorAll('*'))]

  sourceElements.forEach((sourceElement, index) => {
    const targetElement = targetElements[index]
    if (!(sourceElement instanceof HTMLElement || sourceElement instanceof SVGElement) || !targetElement) {
      return
    }

    const sourceStyle = window.getComputedStyle(sourceElement)
    const targetStyle = targetElement instanceof HTMLElement || targetElement instanceof SVGElement ? targetElement.style : null

    if (!targetStyle) {
      return
    }

    for (const propertyName of sourceStyle) {
      targetStyle.setProperty(
        propertyName,
        sourceStyle.getPropertyValue(propertyName),
        sourceStyle.getPropertyPriority(propertyName),
      )
    }
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'sync'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to export canvas.'))
      }
    }, 'image/png')
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
