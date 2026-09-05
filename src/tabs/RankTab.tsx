import { motion } from 'framer-motion'
import { LogIn, Trophy, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { SkeletonRow } from '../components/Skeleton'
import { DotNumber } from '../components/DotNumber'

type Scope = 'friends' | 'community'

interface Player {
  rank: number
  name: string
  avatar: string
  points: number
  change: number
  isUser?: boolean
}

const scopeLabels: Record<Scope, string> = {
  friends: 'friends',
  community: 'community',
}

export function RankTab() {
  const [scope, setScope] = useState<Scope>('community')
  const { user, setShowSignIn } = useApp()
  const [players, setPlayers] = useState<Player[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(50))
    const unsub = onSnapshot(q, (snap) => {
      if (snap.metadata.hasPendingWrites) return
      const allUsers = snap.docs.map((d, i) => ({
        rank: i + 1,
        name: d.data().displayName || 'Anonymous',
        avatar: (d.data().displayName || 'An').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase(),
        points: d.data().points || 0,
        change: Math.floor(Math.random() * 5),
        isUser: d.id === user?.uid,
      }))
      setPlayers(allUsers)
      setLoaded(true)
    }, (error) => {
      console.warn('Unable to load the leaderboard.', error)
      setLoaded(true)
    })
    return unsub
  }, [user])

  const podium = [players[1], players[0], players[2]].filter(Boolean)
  const myPlayer = players.find(p => p.isUser)

  return (
    <motion.div
      key="rank"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-14 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">collective progress</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">leaderboard</h2>
        <p className="mt-1 text-[13px] text-text-muted">celebrating everyday sustainability across our network.</p>
      </div>

      <div className="flex p-1 bg-surface-raised/70 rounded-full mb-7 border border-border max-w-xs mx-auto">
        {(Object.keys(scopeLabels) as Scope[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`relative flex-1 py-2 rounded-full font-body text-[12px] font-medium transition-all ${
              scope === s ? 'text-[#253b54]' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {scope === s && (
              <motion.div
                layoutId="rankScopeIndicator"
                className="absolute inset-0 bg-[#d5e0eb] rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{scopeLabels[s]}</span>
          </button>
        ))}
      </div>

      {!user ? (
        <div className="expressive-card aurora-card p-10 flex flex-col items-center justify-center text-center rounded-[34px] shadow-xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
            <LogIn size={26} strokeWidth={1.8} />
          </div>
          <p className="font-display text-[22px] text-white mb-2">sign in to view your rank</p>
          <p className="font-body text-[13px] text-white/90 mb-6 max-w-[280px] leading-relaxed">
            join your friends and community members climbing the impact leaderboard.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-black font-body text-[13px] font-semibold shadow-md hover:bg-white/95 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>continue with google</span>
          </button>
        </div>
      ) : !loaded ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <>
          {myPlayer && (
            <div className="expressive-card sapphire-card p-5 rounded-[28px] mb-7 shadow-lg flex items-center justify-between text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center font-display text-[16px] font-bold text-white">
                  {myPlayer.avatar}
                </div>
                <div>
                  <span className="font-body text-[11px] text-white/80 uppercase tracking-wider">your standing</span>
                  <h3 className="font-display text-[18px] text-white leading-tight">rank #{myPlayer.rank} overall</h3>
                </div>
              </div>
              <div className="text-right">
                <DotNumber value={myPlayer.points.toLocaleString()} className="text-white fill-white h-6 mb-0.5 ml-auto" />
                <span className="block font-body text-[11px] text-white/80">points</span>
              </div>
            </div>
          )}

          {podium.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 items-end mb-8 pt-2 max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-display text-[15px] shadow-sm ${
                    podium[0].isUser ? 'border-oasis-400 bg-oasis-400/20 text-oasis-400' : 'border-border bg-surface-raised text-text-primary'
                  }`}>
                    {podium[0].avatar}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center font-mono text-[10px] text-text-muted shadow-xs">
                    2
                  </span>
                </div>
                <p className="font-display text-[13px] text-text-primary truncate max-w-[90px] text-center">
                  {podium[0].name.split(' ')[0]}
                </p>
                <p className="font-mono text-[10px] text-text-muted mb-2">
                  {podium[0].points.toLocaleString()} pts
                </p>
                <div className="expressive-card silver-card h-24 w-full rounded-t-[22px] flex items-center justify-center shadow-md">
                  <span className="font-body text-[11px] text-white/90 font-medium">silver</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col items-center -mt-4 z-10"
              >
                <div className="relative mb-2">
                  <div className={`w-18 h-18 rounded-[24px] flex items-center justify-center border-2 font-display text-[19px] shadow-xl ${
                    podium[1].isUser ? 'border-white bg-white/25 text-white' : 'border-amber-300/80 bg-amber-400/15 text-text-primary'
                  }`}>
                    {podium[1].avatar}
                  </div>
                  <span className="absolute -bottom-2 -right-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-md border border-white/40">
                    1st
                  </span>
                </div>
                <p className="font-display text-[14px] font-semibold text-text-primary truncate max-w-[100px] text-center">
                  {podium[1].name.split(' ')[0]}
                </p>
                <p className="font-mono text-[11px] text-amber-500 font-bold mb-2">
                  {podium[1].points.toLocaleString()} pts
                </p>
                <div className="expressive-card gold-card h-32 w-full rounded-t-[26px] flex flex-col items-center justify-center gap-1 shadow-xl">
                  <Trophy size={20} className="text-white drop-shadow-sm" />
                  <span className="font-body text-[11px] text-white font-semibold">champion</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-display text-[15px] shadow-sm ${
                    podium[2].isUser ? 'border-oasis-400 bg-oasis-400/20 text-oasis-400' : 'border-border bg-surface-raised text-text-primary'
                  }`}>
                    {podium[2].avatar}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center font-mono text-[10px] text-text-muted shadow-xs">
                    3
                  </span>
                </div>
                <p className="font-display text-[13px] text-text-primary truncate max-w-[90px] text-center">
                  {podium[2].name.split(' ')[0]}
                </p>
                <p className="font-mono text-[10px] text-text-muted mb-2">
                  {podium[2].points.toLocaleString()} pts
                </p>
                <div className="expressive-card solar-card h-20 w-full rounded-t-[22px] flex items-center justify-center shadow-md">
                  <span className="font-body text-[11px] text-white/90 font-medium">bronze</span>
                </div>
              </motion.div>
            </div>
          )}

          <div className="space-y-2.5">
            {players.map((player) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3.5 p-3.5 rounded-[22px] border transition-all ${
                  player.isUser
                    ? 'bg-oasis-500/15 border-oasis-500/35 shadow-sm'
                    : 'bg-surface-raised/70 border-border/70 hover:bg-surface-raised'
                }`}
              >
                <span className="font-mono text-[12px] text-text-muted w-6 text-center font-medium">
                  {player.rank}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-display text-[12px] ${
                  player.isUser ? 'bg-oasis-400 text-surface font-bold' : 'bg-surface-overlay text-text-primary border border-border'
                }`}>
                  {player.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[13px] text-text-primary truncate">
                    {player.name} {player.isUser && <span className="font-body text-[11px] text-oasis-400 ml-1">(you)</span>}
                  </p>
                  <p className="font-body text-[11px] text-text-muted">
                    {player.points.toLocaleString()} community points
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-surface-overlay/80 border border-border">
                  <TrendingUp size={11} className="text-oasis-400" />
                  <span className="font-mono text-[10px] text-text-muted">+{player.change || 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
