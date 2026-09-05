import { motion } from 'framer-motion'
import { Moon, Sun, ChevronRight, LogOut, Flame, Trophy, Zap, Target, LogIn, MapPin, Camera, Share2, Newspaper } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { doc, updateDoc, collection, query, where, orderBy, limit as fbLimit, onSnapshot } from 'firebase/firestore'
import { ShareCard } from '../components/ShareCard'
import { DotNumber } from '../components/DotNumber'

interface MyPost {
  id: string
  action: string
  points: number
  category: string
  timestamp: { seconds: number } | null
}

function timeAgo(ts: { seconds: number } | null) {
  if (!ts?.seconds) return 'just now'
  const diff = Date.now() - ts.seconds * 1000
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ProfileTab() {
  const { points, co2Saved, streak, level, waterSaved, darkMode, setDarkMode, userData, user, setShowSignIn, signOut } = useApp()
  const [myPosts, setMyPosts] = useState<MyPost[]>([])
  const [showShare, setShowShare] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), fbLimit(20))
    const unsub = onSnapshot(q, (snap) => {
      setMyPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as MyPost)))
    }, (error) => console.warn('Unable to load profile activity.', error))
    return unsub
  }, [user])

  if (!user) {
    return (
      <motion.div
        key="profile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-4 md:px-0"
      >
        <div className="mb-5 pt-1">
          <p className="gallery-label mb-1.5 text-text-muted">account</p>
          <h2 className="font-display text-[26px] leading-tight text-text-primary">profile</h2>
          <p className="mt-1 text-[13px] text-text-muted">manage your account and environmental record</p>
        </div>
        <div className="gallery-card p-8 md:p-10 flex flex-col items-center justify-center text-center rounded-[30px] border border-border">
          <div className="w-14 h-14 rounded-2xl bg-surface-overlay flex items-center justify-center mb-4 text-oasis-400">
            <LogIn size={26} strokeWidth={1.8} />
          </div>
          <p className="font-display text-[20px] font-semibold text-text-primary mb-1">sign in to view profile</p>
          <p className="font-body text-[13px] text-text-muted mb-6 max-w-[280px]">
            track your daily streaks, level progression, and stats across all your devices.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-black font-body text-[13px] font-semibold shadow-md hover:bg-white/95 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>continue with google</span>
          </button>
        </div>
      </motion.div>
    )
  }

  const levelProgress = ((points % 500) / 500) * 100
  const displayName = user.displayName || 'fellow citizen'
  const initials = displayName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()

  const photoURL = userData?.photoURL || user.photoURL || ''
  const userPhotoBase64 = photoURL.startsWith('data:') ? photoURL : ''
  const googlePhotoURL = photoURL && !photoURL.startsWith('data:') ? photoURL : ''

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      await updateDoc(doc(db, 'users', user.uid), { photoURL: base64 })
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-20 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">account</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">profile</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gallery-card p-6 md:p-7 mb-4 rounded-[30px] border border-border shadow-xs"
      >
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            {userPhotoBase64 || googlePhotoURL ? (
              <img src={userPhotoBase64 || googlePhotoURL} alt="" className="w-16 h-16 rounded-2xl object-cover border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-border flex items-center justify-center font-display text-[18px] text-text-primary font-semibold">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-oasis-400 text-surface flex items-center justify-center shadow-xs font-mono text-[9px] font-bold">
              {level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-[18px] text-text-primary font-semibold truncate">{displayName.toLowerCase()}</h3>
            {userData?.location ? (
              <p className="font-body text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                <MapPin size={11} className="text-text-muted" />
                {userData.location}
              </p>
            ) : (
              <p className="font-body text-[11px] text-text-muted mt-0.5">verified member</p>
            )}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="font-body text-[10px] text-text-muted">level {level}</span>
                <span className="font-mono text-[10px] text-text-primary font-medium">{points % 500} / 500 xp</span>
              </div>
              <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-oasis-500 to-gulf-400"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

      <button
        onClick={() => setShowShare(true)}
        className="gallery-primary w-full flex items-center justify-center gap-2 py-3 mb-5 transition-all"
      >
        <Share2 size={14} />
        <span className="font-body text-[12px] font-medium">share your impact</span>
      </button>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={<Flame size={15} className="text-ember-400" />} label="day streak" value={`${streak}`} delay={0.08} />
        <StatCard icon={<Trophy size={15} className="text-dune-400" />} label="total points" value={points.toLocaleString()} delay={0.12} />
        <StatCard icon={<Zap size={15} className="text-oasis-400" />} label="co₂ avoided" value={`${co2Saved.toFixed(1)}`} unit="kg" delay={0.16} />
        <StatCard icon={<Target size={15} className="text-gulf-400" />} label="water saved" value={`${(waterSaved / 1000).toFixed(1)}`} unit="k L" delay={0.2} />
      </div>

      {myPosts.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={14} className="text-text-muted" />
            <span className="gallery-label text-text-muted">recent log activity</span>
          </div>
          <div className="space-y-2">
            {myPosts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-surface-raised/70 rounded-2xl border border-border p-3">
                <div className="w-2 h-2 rounded-full bg-oasis-400 shrink-0" />
                <p className="flex-1 font-body text-[12px] text-text-secondary truncate">{p.action.toLowerCase()}</p>
                {p.points > 0 && (
                  <span className="font-mono text-[10px] text-oasis-400 shrink-0 font-medium">+{p.points} pts</span>
                )}
                <span className="font-body text-[10px] text-text-muted shrink-0">{timeAgo(p.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="gallery-card rounded-[26px] border border-border divide-y divide-border overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={16} className="text-gulf-400" /> : <Sun size={16} className="text-dune-400" />}
            <span className="font-body text-[13px] text-text-primary">dark theme</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${darkMode ? 'bg-[#253b54]' : 'bg-surface-overlay'}`}
          >
            <motion.div
              animate={{ x: darkMode ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-white shadow-xs"
            />
          </button>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-overlay/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} className="text-red-400" />
            <span className="font-body text-[13px] text-red-400">sign out</span>
          </div>
          <ChevronRight size={15} className="text-text-muted" />
        </button>
      </div>

      <ShareCard open={showShare} onClose={() => setShowShare(false)} />
    </motion.div>
  )
}

function StatCard({ icon, label, value, unit, delay }: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="gallery-card p-4 rounded-[22px] border border-border flex flex-col justify-between min-h-[96px]"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-body text-[11px] text-text-muted">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <DotNumber value={value} className="text-text-primary fill-text-primary h-6" />
        {unit && <span className="font-mono text-[11px] text-text-muted">{unit}</span>}
      </div>
    </motion.div>
  )
}
