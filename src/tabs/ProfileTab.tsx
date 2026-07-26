import { motion } from 'framer-motion'
import { Moon, Sun, ChevronRight, LogOut, Flame, Trophy, Zap, Target, LogIn, MapPin, Camera, Share2, Newspaper } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { doc, updateDoc, collection, query, where, orderBy, limit as fbLimit, onSnapshot } from 'firebase/firestore'
import { ShareCard } from '../components/ShareCard'

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
    })
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
        className="px-4 pb-4"
      >
        <div className="mb-5 pt-1">
          <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">PROFILE</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LogIn size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Sign in to your profile</p>
          <p className="font-mono text-[10px] text-text-muted mb-6 max-w-[240px]">
            Track your streaks, stats, and settings across all your devices.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-2 bg-surface-raised hover:bg-surface-overlay border border-border rounded-xl px-5 py-2.5 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-body text-[13px] text-text-primary">Sign in with Google</span>
          </button>
        </div>
      </motion.div>
    )
  }

  const levelProgress = ((points % 500) / 500) * 100

  const displayName = user.displayName || ''
  const initials = displayName.split(' ').map(s => s[0]).join('').slice(0, 3).toUpperCase()

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
      className="px-4 pb-24"
    >
      <div className="mb-5 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">PROFILE</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-5 mb-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-oasis-400/[0.05] rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            {userPhotoBase64 || googlePhotoURL ? (
              <img src={userPhotoBase64 || googlePhotoURL} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-oasis-400 via-gulf-400 to-dune-400 flex items-center justify-center">
                <span className="font-display text-[14px] text-surface">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-surface/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-raised border-2 border-surface flex items-center justify-center">
              <span className="font-mono text-[8px] text-oasis-400 font-bold">{level}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-body text-[16px] font-bold text-text-primary">{displayName}</h3>
            {userData?.location && (
              <p className="font-mono text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                <MapPin size={10} className="text-text-muted" />
                {userData.location}
              </p>
            )}
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[9px] text-text-muted">Level {level}</span>
                <span className="font-mono text-[9px] text-oasis-400">{points % 500}/{500} XP</span>
              </div>
              <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-oasis-500 to-gulf-400"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onClick={() => setShowShare(true)}
        className="w-full flex items-center justify-center gap-2 p-3 mb-4 rounded-xl border border-border bg-surface-raised/40 hover:bg-surface-overlay/50 transition-colors"
      >
        <Share2 size={14} className="text-oasis-400" />
        <span className="font-body text-[12px] font-medium text-text-primary">Share stats to Instagram Story</span>
      </motion.button>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <StatCard icon={<Flame size={14} className="text-ember-400" />} label="Day Streak" value={`${streak}`} delay={0.15} />
        <StatCard icon={<Trophy size={14} className="text-dune-400" />} label="Total Points" value={points.toLocaleString()} delay={0.2} />
        <StatCard icon={<Zap size={14} className="text-oasis-400" />} label="CO₂ Avoided" value={`${co2Saved.toFixed(1)} kg`} delay={0.25} />
        <StatCard icon={<Target size={14} className="text-gulf-400" />} label="Water Saved" value={`${(waterSaved / 1000).toFixed(1)}k L`} delay={0.3} />
      </div>

      {myPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={14} className="text-dune-400" />
            <span className="font-body text-[12px] font-semibold text-text-primary">My Posts</span>
          </div>
          <div className="space-y-2">
            {myPosts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-2.5 bg-surface-raised/40 rounded-xl border border-border p-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-oasis-400 shrink-0" />
                <p className="flex-1 font-body text-[11px] text-text-secondary truncate">{p.action}</p>
                {p.points > 0 && (
                  <span className="font-mono text-[8px] text-oasis-400 shrink-0">+{p.points}</span>
                )}
                <span className="font-mono text-[7px] text-text-muted shrink-0">{timeAgo(p.timestamp)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface-raised/40 rounded-2xl border border-border divide-y divide-border"
      >
        <SettingsRow
          icon={darkMode ? <Moon size={16} className="text-gulf-400" /> : <Sun size={16} className="text-dune-400" />}
          label="Dark Mode"
          action={
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 ${darkMode ? 'bg-oasis-500' : 'bg-surface-overlay'}`}
            >
              <motion.div
                animate={{ x: darkMode ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
              />
            </button>
          }
        />

        <SettingsRow
          icon={<LogOut size={16} className="text-red-400" />}
          label="Sign Out"
          labelColor="text-red-400"
          action={
            <button onClick={signOut}>
              <ChevronRight size={14} className="text-text-muted" />
            </button>
          }
        />
      </motion.div>
      <ShareCard open={showShare} onClose={() => setShowShare(false)} />
    </motion.div>
  )
}

function StatCard({ icon, label, value, delay }: {
  icon: React.ReactNode
  label: string
  value: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface-raised/50 rounded-xl border border-border p-3"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-display text-[18px] text-text-primary leading-none">{value}</span>
    </motion.div>
  )
}

function SettingsRow({ icon, label, action, labelColor }: {
  icon: React.ReactNode
  label: string
  action: React.ReactNode
  labelColor?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        {icon}
        <span className={`font-body text-[13px] ${labelColor || 'text-text-primary'}`}>{label}</span>
      </div>
      {action}
    </div>
  )
}
