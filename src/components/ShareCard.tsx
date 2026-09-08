import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import { useApp } from '../App'
import { X, Download, Share2, AlertCircle } from 'lucide-react'
import { DotNumber } from './DotNumber'
import { brandFontEmbedCss } from '../brandFont'

interface ShareCardProps {
  open: boolean
  onClose: () => void
}

/* The card is a fixed 1080x1920 story frame authored at a third of that size.
   CSS cannot divide one length by another, so the fit-to-viewport ratio is
   measured here; the capture target itself is never scaled, so the exported
   image keeps its full resolution. */
/* Dotted numerals are wide, so large tallies are abbreviated rather than
   allowed to shrink into illegibility. */
function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`
  if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`
  return value.toLocaleString()
}

const CARD_W = 360
const CARD_H = 640
const EXPORT_SCALE = 3
const CHROME_H = 236
const GUTTER = 40

const ACTION_COL_W = 210

function useShareLayout(open: boolean) {
  const [layout, setLayout] = useState({ scale: 1, sideBySide: false })
  useEffect(() => {
    if (!open) return
    const measure = () => {
      const width = window.innerWidth
      const height = window.visualViewport?.height ?? window.innerHeight
      // A phone in landscape has no room for a 9:16 card with the actions
      // stacked under it, so the sheet turns into a row and the card is
      // measured against the height alone.
      const sideBySide = height < 560 && width > height
      const availableW = sideBySide ? width - GUTTER - ACTION_COL_W : width - GUTTER
      const availableH = sideBySide ? height - 40 : height - CHROME_H
      setLayout({
        sideBySide,
        scale: Math.max(0.5, Math.min(1, availableW / CARD_W, availableH / CARD_H)),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [open])
  return layout
}

export function ShareCard({ open, onClose }: ShareCardProps) {
  const { points, co2Saved, waterSaved, streak, level, user, userData } = useApp()
  const cardRef = useRef<HTMLDivElement>(null)
  const { scale: shareScale, sideBySide } = useShareLayout(open)
  const displayName = (user?.displayName || userData?.displayName || 'a rippl member').trim()
  const place = userData?.location?.trim()
  /* Each render of the card is identified by the values it shows, so a stale
     image is never offered for sharing when the numbers change underneath. */
  const signature = [points, co2Saved, waterSaved, streak, level, displayName, place].join('|')
  const [render, setRender] = useState<{ signature: string; url?: string; file?: File } | null>(null)
  const image = render?.signature === signature && render.url && render.file
    ? { url: render.url, file: render.file }
    : null
  const failed = render?.signature === signature && !render.url

  /* iOS only grants navigator.share() inside the gesture that triggered it, and
     rendering the card takes far longer than that window. So the image is built
     as soon as the sheet opens and the button just hands over the finished file. */
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const build = async () => {
      try {
        await document.fonts.ready
        const fontEmbedCSS = await brandFontEmbedCss()
        if (cancelled || !cardRef.current) return
        const url = await toPng(cardRef.current, {
          pixelRatio: EXPORT_SCALE,
          width: CARD_W,
          height: CARD_H,
          fontEmbedCSS,
          skipFonts: !fontEmbedCSS,
        })
        if (cancelled) return
        const blob = await (await fetch(url)).blob()
        if (cancelled) return
        setRender({ signature, url, file: new File([blob], 'rippl-impact.png', { type: 'image/png' }) })
      } catch {
        if (!cancelled) setRender({ signature })
      }
    }
    // A frame of settle time so the card has painted before it is captured.
    const timer = window.setTimeout(build, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, signature])

  const save = useCallback((url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'rippl-impact.png'
    link.click()
  }, [])

  const handleShare = () => {
    if (!image) return
    // Called with no await in front of it so the gesture is still live.
    if (navigator.canShare?.({ files: [image.file] })) {
      navigator.share({ files: [image.file], title: 'my rippl impact' }).catch(() => {})
      return
    }
    save(image.url)
  }

  // The same factor the impact tab uses, so the two screens agree.
  const treeCount = co2Saved / 21.7
  const trees = treeCount >= 100 ? Math.round(treeCount).toLocaleString() : treeCount.toFixed(1)

  const stats = [
    { label: 'points earned', value: points.toLocaleString(), unit: 'lifetime' },
    { label: 'water saved', value: compact(waterSaved), unit: 'litres' },
    { label: 'day streak', value: String(streak), unit: 'in a row' },
    { label: 'level', value: String(level), unit: 'reached' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="share-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="share-overlay fixed inset-0 z-[95] overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={event => event.stopPropagation()}
            className={`share-overlay-inner relative flex items-center gap-4 ${sideBySide ? 'is-side-by-side' : 'flex-col'}`}
            role="dialog"
            aria-modal="true"
            aria-label="share your impact"
          >
            <button
              onClick={onClose}
              aria-label="close"
              className="share-card-close flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X size={17} />
            </button>

            <div className="share-card-frame" style={{ '--share-scale': shareScale } as React.CSSProperties}>
              <div className="share-card-scaler">
                <div ref={cardRef} className="share-card">
                  <div className="share-card-dots" aria-hidden="true" />

                  <header className="share-card-head">
                    <span className="share-card-logo">
                      {/* A real <img> rather than a CSS mask: the exporter
                          inlines image sources, but not mask-image. */}
                      <img className="share-card-mark" src="/brand/rippl-mark-white.png" alt="" width={22} height={22} />
                      rippl
                    </span>
                    <span className="share-card-tag">impact report</span>
                  </header>

                  <div className="share-card-hero">
                    <span className="share-card-hero-label">carbon avoided</span>
                    <DotNumber value={co2Saved >= 10_000 ? compact(co2Saved) : co2Saved.toFixed(1)} className="share-card-hero-number" />
                    <span className="share-card-hero-unit">kilograms of co₂</span>
                    <span className="share-card-equivalent">≈ {trees} trees working for a year</span>
                  </div>

                  <div className="share-card-grid">
                    {stats.map(stat => (
                      <div key={stat.label} className="share-card-stat">
                        <span className="share-card-stat-label">{stat.label}</span>
                        <DotNumber value={stat.value} className="share-card-stat-number" />
                        <span className="share-card-stat-unit">{stat.unit}</span>
                      </div>
                    ))}
                  </div>

                  <footer className="share-card-foot">
                    <div className="share-card-who">
                      <span className="share-card-name">{displayName}</span>
                      <span className="share-card-place">{place || 'everyday climate action'}</span>
                    </div>
                    <span className="share-card-domain">rippl.earth</span>
                  </footer>
                </div>
              </div>
            </div>

            <div className="share-card-actions">
            <button
              onClick={handleShare}
              disabled={!image}
              className="share-card-action"
            >
              {image ? <Share2 size={16} /> : failed ? <AlertCircle size={16} /> : <span className="share-card-spinner" aria-hidden="true" />}
              <span>{image ? 'share your impact' : failed ? 'could not build the image' : 'preparing image...'}</span>
            </button>

            <button
              onClick={() => image && save(image.url)}
              disabled={!image}
              className="share-card-secondary"
            >
              <Download size={13} />
              <span>save image</span>
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
