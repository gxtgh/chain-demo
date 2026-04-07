import { Button, QRCode, message } from 'antd'
import { useRef } from 'react'
import { AppModal } from '@/components/common/modal'
import { ShareIcon } from '@/components/common/topbar-icons'
import { useRouteContext } from '@/app/use-route-context'
import { supportedChains } from '@/config/chains'
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from '@/config/site'
import './styles.scss'

type ShareSiteModalProps = {
  onClose: () => void
  open: boolean
}

export function ShareSiteModal({ onClose, open }: ShareSiteModalProps) {
  const { t, themeColor } = useRouteContext()
  const qrCodeRef = useRef<HTMLDivElement | null>(null)
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

  async function shareOrDownloadImage() {
    try {
      const imageBlob = await createSharePosterImage({
        appName: t('app.name'),
        chainSummary,
        description: t('share.description'),
        email: SUPPORT_EMAIL,
        eyebrow: t('share.eyebrow'),
        featureNoCode: t('share.featureNoCode'),
        featureTokens: t('share.featureTokens'),
        featuredChains: featuredChains.join(' / '),
        qrSvg: qrCodeRef.current?.querySelector('svg') ?? null,
        qrText: t('share.qrText'),
        qrTitle: t('share.qrTitle'),
        shareUrl,
        themeColor,
        title: t('share.title'),
        toolsText: t('share.toolsText'),
        toolsTitle: t('share.toolsTitle'),
        visualLabel: t('share.visualLabel'),
      })
      const file = new File([imageBlob], 'web3-token-share.png', { type: imageBlob.type })
      const shareData: ShareData = {
        files: [file],
        title: SITE_NAME,
        text: t('share.description'),
      }

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        return
      }

      downloadBlob(imageBlob, file.name)
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
          <Button className="share-modal-screenshot-button" onClick={() => void shareOrDownloadImage()}>{t('share.downloadImage')}</Button>
          <Button className="share-modal-copy-button" type="primary" onClick={() => void copyShareLink()}>
            {t('share.copyLink')}
          </Button>
        </>
      }
    >
      <section className="share-site-panel">
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

type SharePosterData = {
  appName: string
  chainSummary: string
  description: string
  email: string
  eyebrow: string
  featureNoCode: string
  featureTokens: string
  featuredChains: string
  qrSvg: SVGSVGElement | null
  qrText: string
  qrTitle: string
  shareUrl: string
  themeColor: string
  title: string
  toolsText: string
  toolsTitle: string
  visualLabel: string
}

async function createSharePosterImage(data: SharePosterData) {
  await document.fonts?.ready

  const width = 1200
  const height = 760
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context unavailable.')
  }

  const palette = getPosterPalette(data.themeColor)
  context.scale(scale, scale)
  drawPosterBackground(context, width, height, palette)
  drawPosterCopy(context, data, palette)
  await drawPosterVisual(context, data, palette)

  return await canvasToBlob(canvas)
}

type PosterPalette = ReturnType<typeof getPosterPalette>

function getPosterPalette(themeColor: string) {
  const accentMap: Record<string, { accent: string; accentStrong: string; glow: string }> = {
    green: { accent: '#00d18f', accentStrong: '#23f2bb', glow: 'rgba(0, 209, 143, 0.28)' },
    purple: { accent: '#a974ff', accentStrong: '#c59cff', glow: 'rgba(169, 116, 255, 0.28)' },
    orange: { accent: '#ff6b2d', accentStrong: '#ff9a63', glow: 'rgba(255, 107, 45, 0.28)' },
  }

  return {
    ...(accentMap[themeColor] ?? accentMap.orange),
    bg: '#10101a',
    card: '#292a34',
    cardSoft: '#242630',
    line: 'rgba(255, 255, 255, 0.16)',
    muted: 'rgba(246, 239, 233, 0.68)',
    text: '#fff7ef',
  }
}

function drawPosterBackground(context: CanvasRenderingContext2D, width: number, height: number, palette: PosterPalette) {
  context.fillStyle = palette.bg
  context.fillRect(0, 0, width, height)

  const glow = context.createRadialGradient(850, 130, 20, 850, 130, 420)
  glow.addColorStop(0, palette.glow)
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)

  const lowerGlow = context.createRadialGradient(280, 640, 20, 280, 640, 360)
  lowerGlow.addColorStop(0, palette.glow)
  lowerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = lowerGlow
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(255, 255, 255, 0.04)'
  context.lineWidth = 1
  for (let x = 0; x <= width; x += 56) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + 80, height)
    context.stroke()
  }
  for (let y = 0; y <= height; y += 56) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y - 80)
    context.stroke()
  }
}

function drawPosterCopy(context: CanvasRenderingContext2D, data: SharePosterData, palette: PosterPalette) {
  context.fillStyle = palette.accent
  context.font = '700 18px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.eyebrow.toUpperCase(), 72, 82)

  context.fillStyle = palette.text
  context.font = '800 78px "SF Pro Display", "PingFang SC", sans-serif'
  drawWrappedText(context, data.title, 72, 160, 430, 78, 2)

  context.fillStyle = palette.muted
  context.font = '500 20px "SF Pro Display", "PingFang SC", sans-serif'
  drawWrappedText(context, data.description, 72, 330, 470, 34, 3)

  const points = [data.featureTokens, data.chainSummary, data.featureNoCode]
  points.forEach((point, index) => {
    const y = 440 + index * 72
    drawRoundRect(context, 72, y, 470, 54, 18, 'rgba(255, 255, 255, 0.08)', palette.line)
    context.fillStyle = palette.accent
    context.beginPath()
    context.arc(94, y + 27, 6, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = palette.text
    context.font = '700 17px "SF Pro Display", "PingFang SC", sans-serif'
    drawWrappedText(context, point, 114, y + 22, 400, 23, 2)
  })

  drawRoundRect(context, 72, 662, 470, 58, 18, 'rgba(255, 255, 255, 0.08)', palette.line)
  context.fillStyle = palette.accent
  context.font = '800 13px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.qrTitle.toUpperCase(), 98, 688)
  context.fillStyle = palette.text
  context.font = '700 18px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.shareUrl, 98, 713)
}

async function drawPosterVisual(context: CanvasRenderingContext2D, data: SharePosterData, palette: PosterPalette) {
  drawRoundRect(context, 610, 96, 520, 560, 34, 'rgba(255, 255, 255, 0.06)', palette.line)
  context.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  context.lineWidth = 1
  for (let x = 630; x < 1120; x += 54) {
    context.beginPath()
    context.moveTo(x, 112)
    context.lineTo(x - 70, 640)
    context.stroke()
  }
  for (let y = 126; y < 640; y += 54) {
    context.beginPath()
    context.moveTo(626, y)
    context.lineTo(1110, y - 46)
    context.stroke()
  }

  drawRoundRect(context, 660, 152, 410, 76, 22, 'rgba(255, 255, 255, 0.1)', palette.line)
  context.fillStyle = palette.muted
  context.font = '800 14px "SF Pro Display", sans-serif'
  context.fillText(data.visualLabel.toUpperCase(), 684, 195)
  context.fillStyle = palette.text
  context.font = '800 24px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.appName, 884, 195)
  drawShareGlyph(context, 1035, 190, palette.accent)

  drawRoundRect(context, 775, 320, 350, 118, 22, 'rgba(255, 255, 255, 0.1)', palette.line)
  context.fillStyle = palette.text
  context.font = '800 25px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.toolsTitle, 802, 366)
  context.fillStyle = palette.muted
  context.font = '700 16px "SF Pro Display", "PingFang SC", sans-serif'
  drawWrappedText(context, data.toolsText, 802, 396, 286, 24, 2)

  drawRoundRect(context, 678, 506, 346, 110, 22, 'rgba(255, 255, 255, 0.1)', palette.line)
  context.fillStyle = palette.text
  context.font = '800 24px "SF Pro Display", "PingFang SC", sans-serif'
  context.fillText(data.qrTitle, 706, 548)
  context.fillStyle = palette.muted
  context.font = '700 15px "SF Pro Display", sans-serif'
  drawWrappedText(context, data.featuredChains, 706, 580, 280, 24, 2)

  if (data.qrSvg) {
    const qrImage = await loadSvgImage(data.qrSvg)
    drawRoundRect(context, 882, 520, 118, 118, 18, '#ffffff', 'rgba(255, 255, 255, 0.32)')
    context.drawImage(qrImage, 892, 530, 98, 98)
  }
}

function drawShareGlyph(context: CanvasRenderingContext2D, x: number, y: number, color: string) {
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(x - 18, y)
  context.lineTo(x + 12, y - 18)
  context.moveTo(x - 18, y)
  context.lineTo(x + 12, y + 18)
  context.stroke()
  ;[
    [x - 20, y],
    [x + 14, y - 20],
    [x + 14, y + 20],
  ].forEach(([cx, cy]) => {
    context.beginPath()
    context.arc(cx, cy, 6, 0, Math.PI * 2)
    context.fill()
  })
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fillStyle = fill
  context.fill()
  if (stroke) {
    context.strokeStyle = stroke
    context.stroke()
  }
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Number.POSITIVE_INFINITY,
) {
  const segments = segmentText(text)
  let line = ''
  let lines = 0

  for (const segment of segments) {
    const testLine = line ? `${line}${segment}` : segment
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, y + lines * lineHeight)
      line = segment
      lines += 1
      if (lines >= maxLines) return
    } else {
      line = testLine
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line.trim(), x, y + lines * lineHeight)
  }
}

function segmentText(text: string) {
  const segments = text.match(/[\u4e00-\u9fa5]|[^\u4e00-\u9fa5\s]+|\s+/g)
  return segments ?? [text]
}

async function loadSvgImage(svgElement: SVGSVGElement) {
  const serializedSvg = new XMLSerializer().serializeToString(svgElement)
  const blob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    return await loadImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }
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
