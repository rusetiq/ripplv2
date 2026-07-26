import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import { useApp } from '../App'
import { X, Download, Share2, Trophy, Wind, Droplets, Flame, Waves } from 'lucide-react'

interface ShareCardProps {
  open: boolean
  onClose: () => void
}

const bgImages = [
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=1080&h=1920&fit=crop',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1080&h=1920&fit=crop',
]

function pickImage() {
  return bgImages[Math.floor(Math.random() * bgImages.length)]
}

export function ShareCard({ open, onClose }: ShareCardProps) {
  const { points, co2Saved, waterSaved, streak, level, user, userData } = useApp()
  const cardRef = useRef<HTMLDivElement>(null)
  const [capturing, setCapturing] = useState(false)
  const [bg, setBg] = useState('')
  const [loaded, setLoaded] = useState(false)
  const displayName = user?.displayName || userData?.displayName || 'Rippl User'

  useEffect(() => {
    if (!open) return
    setLoaded(false)
    const src = pickImage()
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { setBg(src); setLoaded(true) }
    img.src = src
  }, [open])

  const captureCard = async () => {
    if (!cardRef.current) return null
    await new Promise(r => setTimeout(r, 100))
    return toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false,
    })
  }

  const handleShare = async () => {
    setCapturing(true)
    try {
      const dataUrl = await captureCard()
      if (!dataUrl) return
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'rippl-stats.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Rippl Impact' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'rippl-stats.png'
        a.click()
      }
    } catch {
    } finally {
      setCapturing(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    setCapturing(true)
    try {
      const dataUrl = await captureCard()
      if (!dataUrl) return
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'rippl-stats.png'
      a.click()
    } catch {} finally { setCapturing(false) }
  }

  const stats = [
    { icon: <Trophy size={18} />, value: points.toLocaleString(), label: 'Points', color: '#fbbf24' },
    { icon: <Wind size={18} />, value: `${co2Saved.toFixed(1)} kg`, label: 'CO₂ Avoided', color: '#34d399' },
    { icon: <Droplets size={18} />, value: `${(waterSaved / 1000).toFixed(1)}k L`, label: 'Water Saved', color: '#67e8f9' },
    { icon: <Flame size={18} />, value: `${streak} day${streak !== 1 ? 's' : ''}`, label: 'Streak', color: '#fb923c' },
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-8"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative flex flex-col items-center gap-4"
          >
            <button
              onClick={onClose}
              className="self-end mr-1 w-8 h-8 rounded-full bg-surface-raised border border-border flex items-center justify-center hover:bg-surface-overlay transition-colors"
            >
              <X size={14} className="text-text-primary" />
            </button>

            <div
              ref={cardRef}
              className="relative w-[360px] h-[640px] overflow-hidden rounded-3xl"
              style={{
                background: loaded && bg
                  ? `linear-gradient(rgba(6,13,9,0.55) 0%, rgba(6,13,9,0.35) 40%, rgba(6,13,9,0.8) 100%), url(${bg}) center / cover no-repeat`
                  : '#060d09',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: 'linear-gradient(90deg, #34d399, #22d3ee, #34d399)' }}
              />

              <div className="absolute top-10 left-8 flex items-center gap-2.5">
                <Waves size={16} className="text-oasis-400" strokeWidth={1.5} />
                <span
                  className="text-base tracking-[0.2em] font-bold leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Climate Crisis", cursive',
                  }}
                >
                  RIPPL
                </span>
              </div>

              <div className="absolute top-28 left-0 right-0 flex flex-col items-center">
                <p
                  className="text-xl font-bold text-center px-8 leading-tight mb-4"
                  style={{ color: 'rgba(232, 228, 220, 0.95)', fontFamily: '"Anybody", sans-serif' }}
                >
                  {displayName}
                </p>
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono"
                  style={{
                    background: 'rgba(6, 13, 9, 0.7)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    color: '#34d399',
                  }}
                >
                  Level {level} · {points.toLocaleString()} pts
                </span>
              </div>

              <div className="absolute top-48 left-8 right-8 flex flex-col gap-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                    style={{
                      background: 'rgba(6, 13, 9, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-mono text-[8px] uppercase tracking-wider block"
                        style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                      >
                        {stat.label}
                      </span>
                      <span
                        className="text-lg font-bold block leading-tight mt-0.5"
                        style={{
                          fontFamily: '"Climate Crisis", cursive',
                          color: 'rgba(232, 228, 220, 0.95)',
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span
                  className="text-[8px] font-mono tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                >
                  saarthaii.web.app
                </span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleShare}
              disabled={capturing}
              className="flex items-center gap-2.5 px-8 py-3 rounded-2xl text-surface font-body text-[13px] font-bold shadow-lg disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                boxShadow: '0 8px 24px rgba(52, 211, 153, 0.2)',
              }}
            >
              {capturing ? (
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
              ) : (
                <Share2 size={16} />
              )}
              {capturing ? 'Generating...' : 'Share to Story'}
            </motion.button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 font-mono text-[10px] transition-colors"
              style={{ color: 'rgba(232, 228, 220, 0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(232, 228, 220, 0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(232, 228, 220, 0.4)'}
            >
              <Download size={12} />
              Download PNG
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
