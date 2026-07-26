import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { SkeletonRow } from '../components/Skeleton'

type Scope = 'friends' | 'uae'

interface Player {
  rank: number
  name: string
  avatar: string
  points: number
  change: number
  isUser?: boolean
}

const scopeLabels: Record<Scope, string> = {
  friends: 'Friends',
  uae: 'UAE',
}

const rankMedals = ['🥇', '🥈', '🥉']

export function RankTab() {
  const [scope, setScope] = useState<Scope>('friends')
  const { user } = useApp()
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
    })
    return unsub
  }, [user])

  const board = players.slice(0, 3)

  return (
    <motion.div
      key="rank"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4"
    >
      <div className="mb-4 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">LEADERBOARD</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">weekly sustainability rankings</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-raised/60 rounded-xl mb-8 border border-border">
        {(Object.keys(scopeLabels) as Scope[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`relative flex-1 py-2 rounded-lg font-body text-[11px] font-medium transition-all duration-200 ${scope === s ? 'text-oasis-400' : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            {scope === s && (
              <motion.div
                layoutId="scopeIndicator"
                className="absolute inset-0 bg-surface-overlay/80 rounded-lg border border-border-active"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{scopeLabels[s]}</span>
          </button>
        ))}
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LogIn size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Sign in to see the leaderboard</p>
        </div>
      ) : !loaded ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="flex items-end justify-center gap-4 h-64 mb-8">
          {[1, 0, 2].map((idx) => {
            const p = board[idx]
            if (!p) return null
            const rank = idx === 0 ? 1 : idx === 1 ? 2 : 3
            const isMe = p.isUser
            const height = rank === 1 ? 'h-40' : rank === 2 ? 'h-32' : 'h-24'
            const order = rank === 2 ? '-ml-4' : rank === 3 ? '-mr-4' : 'z-10'
            return (
              <div key={idx} className={`flex flex-col items-center gap-2 ${order}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full border-2 ${isMe ? 'border-oasis-400' : 'border-border'} bg-surface flex items-center justify-center mb-1 shadow-lg`}>
                    <span className="text-[14px] font-bold">{p.avatar}</span>
                  </div>
                  <p className="font-body text-[11px] font-medium">{p.name.split(' ')[0]}</p>
                  <p className="font-mono text-[9px] text-text-muted">{p.points} pts</p>
                </div>
                <div className={`${height} w-24 rounded-t-2xl bg-gradient-to-t ${isMe ? 'from-oasis-500/30' : 'from-surface-raised'} to-transparent border-t border-x border-border flex items-start justify-center pt-4`}>
                  <span className="text-2xl">{rankMedals[rank - 1]}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.rank}
            className={`flex items-center gap-3 p-3 rounded-xl border ${player.isUser ? 'bg-oasis-500/10 border-oasis-500/30' : 'bg-surface-raised/40 border-border'}`}
          >
            <span className="font-mono text-[11px] w-6">{player.rank}</span>
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-[10px]">{player.avatar}</div>
            <div className="flex-1">
              <p className="font-body text-[12px] font-semibold">{player.name}</p>
              <p className="font-mono text-[10px] text-text-muted">{player.points} pts</p>
            </div>
            <span className="font-mono text-[10px] text-oasis-400">+{player.change || 1}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

}
