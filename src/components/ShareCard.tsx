import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useApp } from '../App'
import { X, Download, Share2, AlertCircle } from 'lucide-react'
import { DotNumber } from './DotNumber'
import { brandFontEmbedCss } from '../brandFont'
import { ShareImageSearch } from './ShareImageSearch'
import { compressImage } from '../utils'

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
const CHROME_H = 420
const GUTTER = 40

const ACTION_COL_W = 320

const backgrounds = [
  { name: 'city', src: '/assets/plates/transit-evidence.jpg' },
]
type Metric = 'carbon' | 'points' | 'water' | 'streak' | 'level'

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
      const sideBySide = width >= 800 || (height < 560 && width > height)
      const availableW = sideBySide ? width - GUTTER - ACTION_COL_W : width - GUTTER
      const availableH = sideBySide ? height - 40 : height - CHROME_H
      setLayout({
        sideBySide,
        scale: Math.max(0.1, Math.min(1, availableW / CARD_W, availableH / CARD_H)),
      })
    }
    measure()
    window.visualViewport?.addEventListener('resize', measure)
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      window.visualViewport?.removeEventListener('resize', measure)
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [open])
  return layout
}

export function ShareCard({ open, onClose }: ShareCardProps) {
  const app = useApp()
  const { user, me } = app
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0
  const points = number(app.points), co2Saved = number(app.co2Saved), waterSaved = number(app.waterSaved), streak = number(app.streak), level = number(app.level)
  const cardRef = useRef<HTMLDivElement>(null)
  const { scale: shareScale, sideBySide } = useShareLayout(open)
  const name = user?.displayName || me?.displayName
  const displayName = typeof name === 'string' && name.trim() ? name.trim() : 'a rippl member'
  const place = typeof me?.location === 'string' ? me.location.trim() : ''
  const [background, setBackground] = useState(backgrounds[0].src)
  const [galleryPhoto, setGalleryPhoto] = useState('')
  const [blur, setBlur] = useState(6)
  const [selected, setSelected] = useState<Metric[]>(['carbon', 'points', 'water'])
  const [uploading, setUploading] = useState(false)
  const [searchChoosing, setSearchChoosing] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const photoRequest = useRef(0)
  useEffect(() => () => { photoRequest.current += 1 }, [])
  const choosePhoto = async (file?: File) => {
    if (!file) return
    const request = ++photoRequest.current
    setUploading(true)
    setPhotoError('')
    try {
      const blob = await compressImage(file, 1920, 0.85)
      if (request !== photoRequest.current) return
      const photo = URL.createObjectURL(blob)
      setGalleryPhoto(previous => {
        if (previous) URL.revokeObjectURL(previous)
        return photo
      })
      setBackground(photo)
    } catch {
      if (request === photoRequest.current) setPhotoError('That photo could not be opened. Try a JPEG or PNG.')
    } finally {
      if (request === photoRequest.current) setUploading(false)
    }
  }
  const chooseBackground = (src: string) => {
    photoRequest.current += 1
    setUploading(false)
    setBackground(src)
  }
  const [attempt, setAttempt] = useState(0)
  const [shareError, setShareError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => previous?.focus()
  }, [open])
  /* Each render of the card is identified by the values it shows, so a stale
     image is never offered for sharing when the numbers change underneath. */
  const signature = [points, co2Saved, waterSaved, streak, level, displayName, place, background, blur, selected.join(',')].join('|')
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
        await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))])
        const { toPng } = await import('html-to-image')
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
    const timer = window.setTimeout(build, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, signature, attempt])

  const save = useCallback((url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'rippl-impact.png'
    document.body.append(link)
    link.click()
    link.remove()
  }, [])

  const handleShare = () => {
    if (!image) return
    // Called with no await in front of it so the gesture is still live.
    try {
      if (navigator.share && navigator.canShare?.({ files: [image.file] })) {
        void navigator.share({ files: [image.file], title: 'my rippl impact' }).catch(error => {
          if (error?.name !== 'AbortError') setShareError('Sharing was unavailable. You can still save the image below.')
        })
        return
      }
      save(image.url)
    } catch {
      setShareError('Sharing was unavailable. You can still save the image below.')
    }
  }

  // The same factor the impact tab uses, so the two screens agree.
  const treeCount = co2Saved / 21.7
  const trees = treeCount >= 100 ? Math.round(treeCount).toLocaleString() : treeCount.toFixed(1)

  const metrics: Record<Metric, { label: string; value: string; unit: string }> = {
    carbon: { label: 'carbon avoided', value: co2Saved >= 10_000 ? compact(co2Saved) : co2Saved.toFixed(1), unit: 'kilograms of co₂' },
    points: { label: 'points earned', value: compact(points), unit: 'lifetime points' },
    water: { label: 'water saved', value: compact(waterSaved), unit: 'litres' },
    streak: { label: 'day streak', value: String(streak), unit: 'days in a row' },
    level: { label: 'level', value: String(level), unit: 'reached' },
  }
  const primary = metrics[selected[0]]
  const toggleMetric = (id: Metric) => setSelected(current => current.includes(id)
    ? current.length > 1 ? current.filter(value => value !== id) : current
    : [...current, id])

  return createPortal(
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
            ref={dialogRef}
            onKeyDown={event => {
              if (event.key === 'Escape') { event.stopPropagation(); onClose() }
              if (event.key !== 'Tab') return
              const buttons = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([hidden]), select:not(:disabled), a[href]')]
              const first = buttons[0], last = buttons[buttons.length - 1]
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
            }}
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
                  <img className="share-card-background" src={background} alt="" style={{ filter: `blur(${blur}px)` }} />
                  <div className="share-card-shade" aria-hidden="true" />

                  <header className="share-card-head">
                    <span className="share-card-logo">
                      {/* A real <img> rather than a CSS mask: the exporter
                          inlines image sources, but not mask-image. */}
                      <img className="share-card-mark" src="/brand/rippl-mark-white.png" alt="" width={22} height={22} />
                      rippl
                    </span>
                  </header>

                  <div className="share-card-hero">
                    <span className="share-card-hero-label">{primary.label}</span>
                    <DotNumber value={primary.value} className="share-card-hero-number" />
                    <span className="share-card-hero-unit">{primary.unit}</span>
                    {selected[0] === 'carbon' && <span className="share-card-equivalent">≈ {trees} trees working for a year</span>}
                  </div>

                  {selected.length > 1 && <div className="share-card-grid">
                    {selected.slice(1).map(id => (
                      <div key={id} className="share-card-stat">
                        <span className="share-card-stat-label">{metrics[id].label}</span>
                        <DotNumber value={metrics[id].value} className="share-card-stat-number" />
                        <span className="share-card-stat-unit">{metrics[id].unit}</span>
                      </div>
                    ))}
                  </div>}

                  <footer className="share-card-foot">
                    <div className="share-card-who">
                      <span className="share-card-name">{displayName}</span>
                      {place && <span className="share-card-place">{place}</span>}
                    </div>
                  </footer>
                </div>
              </div>
            </div>

            <div className="share-card-actions">
            <div className="share-customize">
              <h2>make it yours</h2>
              <fieldset>
                <legend>background</legend>
                <div className="share-backgrounds">
                  {backgrounds.map(photo => <button type="button" key={photo.name} disabled={searchChoosing} aria-label={`${photo.name} background`} aria-pressed={background === photo.src} onClick={() => chooseBackground(photo.src)}><img src={photo.src} alt="" /><span>{photo.name}</span></button>)}
                  {galleryPhoto && <button type="button" disabled={searchChoosing} aria-label="your photo background" aria-pressed={background === galleryPhoto} onClick={() => chooseBackground(galleryPhoto)}><img src={galleryPhoto} alt="" /><span>your photo</span></button>}
                </div>
                <ShareImageSearch onChoose={choosePhoto} onBusy={setSearchChoosing} />
                <label className="share-photo-picker">{uploading ? 'opening photo…' : 'choose from gallery'}<input type="file" accept="image/*" disabled={uploading || searchChoosing} onChange={event => { void choosePhoto(event.target.files?.[0]); event.target.value = '' }} /></label>
                {photoError && <p role="alert">{photoError}</p>}
              </fieldset>
              <label className="share-blur">background blur <span>{blur}px</span><input aria-label="background blur" type="range" min="0" max="16" step="1" value={blur} onChange={event => setBlur(Number(event.target.value))} /></label>
              <fieldset>
                <legend>stats to show</legend>
                <div className="share-metric-options">{(Object.keys(metrics) as Metric[]).map(id => <label key={id}><input type="checkbox" checked={selected.includes(id)} disabled={selected.length === 1 && selected[0] === id} onChange={() => toggleMetric(id)} />{metrics[id].label}</label>)}</div>
              </fieldset>
              <label className="share-featured">featured stat<select aria-label="featured stat" value={selected[0]} onChange={event => { const id = event.target.value as Metric; setSelected(current => [id, ...current.filter(value => value !== id)]) }}>{selected.map(id => <option key={id} value={id}>{metrics[id].label}</option>)}</select></label>
            </div>
            {shareError && <p role="alert" className="text-center text-sm text-white">{shareError}</p>}
            <button
              onClick={failed ? () => { setRender(null); setAttempt(value => value + 1) } : handleShare}
              disabled={uploading || searchChoosing || (!image && !failed)}
              className="share-card-action"
            >
              {image ? <Share2 size={16} /> : failed ? <AlertCircle size={16} /> : <span className="share-card-spinner" aria-hidden="true" />}
              <span>{image ? 'share your impact' : failed ? 'try preparing the image again' : 'preparing image...'}</span>
            </button>

            <button
              onClick={() => image && save(image.url)}
              disabled={uploading || searchChoosing || !image}
              className="share-card-secondary"
            >
              <Download size={13} />
              <span>save image</span>
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
