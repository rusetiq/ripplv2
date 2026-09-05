import { motion } from 'framer-motion'
import { TreePine, Droplets, Wind, Target, Lock, Award, CheckCircle2, Train, Sun, Globe, Flower, Shield, Trophy, LogIn, Sparkles } from 'lucide-react'
import { useApp } from '../App'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { SkeletonMetricCard, SkeletonBadgeCard, SkeletonBarChart } from '../components/Skeleton'

interface Badge {
  id: string
  name: string
  description: string
  Icon: React.ElementType
  gradient: string
  glowColor: string
}

const badgeDefs: Badge[] = [
  { id: 'b1', name: 'first ripple', description: 'log your first sustainability action', Icon: CheckCircle2, gradient: 'from-oasis-400 to-gulf-400', glowColor: 'rgba(94, 206, 156, 0.3)' },
  { id: 'b2', name: 'metro master', description: '10 low-emission metro commutes', Icon: Train, gradient: 'from-gulf-400 to-oasis-500', glowColor: 'rgba(74, 179, 217, 0.3)' },
  { id: 'b3', name: 'oasis keeper', description: 'save over 1,000 litres of clean water', Icon: Droplets, gradient: 'from-gulf-300 to-gulf-500', glowColor: 'rgba(154, 214, 237, 0.3)' },
  { id: 'b4', name: 'solar pioneer', description: 'record 5 solar energy days', Icon: Sun, gradient: 'from-dune-400 to-ember-400', glowColor: 'rgba(217, 182, 104, 0.3)' },
  { id: 'b5', name: 'net zero hero', description: 'offset 500 kg of carbon dioxide', Icon: Globe, gradient: 'from-oasis-500 to-gulf-400', glowColor: 'rgba(62, 157, 115, 0.3)' },
  { id: 'b6', name: 'desert bloom', description: 'maintain a 30-day streak', Icon: Flower, gradient: 'from-oasis-300 to-dune-400', glowColor: 'rgba(156, 221, 182, 0.3)' },
  { id: 'b7', name: 'carbon crusher', description: 'offset 1,000 kg of carbon emissions', Icon: Shield, gradient: 'from-ember-400 to-dune-500', glowColor: 'rgba(217, 119, 86, 0.3)' },
  { id: 'b8', name: 'community champion', description: 'reach the top 10 community leaderboard', Icon: Trophy, gradient: 'from-dune-300 to-dune-500', glowColor: 'rgba(237, 214, 154, 0.3)' },
]

function getWeekDates() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

function useWeeklyData(userId: string | undefined) {
  const [dailyPoints, setDailyPoints] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    if (!userId) return
    const week = getWeekDates()
    const startOfWeek = new Date(week[0])
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(week[6])
    endOfWeek.setHours(23, 59, 59, 999)

    const q = query(
      collection(db, 'userActions'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfWeek)),
      where('timestamp', '<=', Timestamp.fromDate(endOfWeek)),
    )

    getDocs(q).then(snap => {
      const pointsByDay = week.map(d => d.toISOString().split('T')[0]).reduce((acc, day) => {
        acc[day] = 0
        return acc
      }, {} as Record<string, number>)

      snap.forEach(doc => {
        const data = doc.data()
        const ts = data.timestamp
        if (ts?.seconds) {
          const day = new Date(ts.seconds * 1000).toISOString().split('T')[0]
          if (pointsByDay[day] !== undefined) {
            pointsByDay[day] += data.points || 0
          }
        }
      })

      setDailyPoints(week.map(d => pointsByDay[d.toISOString().split('T')[0]]))
    })
  }, [userId])

  return dailyPoints
}

export function ImpactTab() {
  const { co2Saved, waterSaved, userData, user, setShowSignIn } = useApp()
  const dailyPoints = useWeeklyData(user?.uid)
  const treesEquivalent = (co2Saved / 21.7).toFixed(1)

  const netZeroTarget = 350
  const netZeroProgress = Math.min((co2Saved / netZeroTarget) * 100, 100)

  const userBadges = userData?.badges ?? {}
  const unlockedCount = badgeDefs.filter(b => userBadges[b.id]?.unlocked).length

  return (
    <motion.div
      key="impact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-8 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">all time</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">your impact</h2>
        <p className="mt-1 text-[13px] text-text-muted">tangible environmental progress from your daily routines.</p>
      </div>

      <div className="gallery-card p-6 mb-5 rounded-[28px] border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-oasis-400">
              <Target size={16} />
            </div>
            <span className="font-display text-[15px] text-text-primary">net zero milestone</span>
          </div>
          <span className="font-mono text-[11px] text-text-muted">{Math.round(netZeroProgress)}% completed</span>
        </div>

        <div className="relative h-2 bg-surface-overlay rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${netZeroProgress}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-oasis-500 to-gulf-400"
          />
        </div>

        <div className="flex justify-between items-center text-[12px]">
          <span className="font-mono font-medium text-text-primary">{co2Saved.toFixed(1)} kg CO₂ avoided</span>
          <span className="font-mono text-text-muted">{netZeroTarget} kg target</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {!user ? (
          <>
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </>
        ) : (
          <>
            <MetricCard
              icon={<Wind size={16} className="text-oasis-400" />}
              value={`${co2Saved.toFixed(1)}`}
              unit="kg CO₂"
              label="avoided"
              delay={0.08}
            />
            <MetricCard
              icon={<Droplets size={16} className="text-gulf-300" />}
              value={`${(waterSaved / 1000).toFixed(1)}k`}
              unit="litres"
              label="water saved"
              delay={0.12}
            />
            <MetricCard
              icon={<TreePine size={16} className="text-oasis-500" />}
              value={treesEquivalent}
              unit="trees"
              label="equivalent"
              delay={0.16}
            />
          </>
        )}
      </div>

      {!user ? (
        <div className="gallery-card p-10 flex flex-col items-center justify-center text-center rounded-[30px] border border-border">
          <div className="w-14 h-14 rounded-2xl bg-surface-overlay flex items-center justify-center mb-4 text-text-muted">
            <LogIn size={26} strokeWidth={1.8} />
          </div>
          <p className="font-display text-[18px] text-text-primary mb-1">sign in to track impact</p>
          <p className="font-body text-[13px] text-text-muted mb-6 max-w-[280px]">
            see personal emissions avoided, water saved, and collect milestone badges.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="gallery-primary inline-flex items-center gap-2.5 px-6 py-3 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-body text-[13px] font-medium">continue with google</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Award size={15} className="text-oasis-400" />
                <span className="gallery-label text-text-primary">milestone badges</span>
              </div>
              <span className="font-mono text-[11px] text-text-muted">
                {unlockedCount} / {badgeDefs.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!userData?.points && !userData?.badges ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonBadgeCard key={i} />)
              ) : badgeDefs.map((badge, i) => {
                const userBadge = userBadges[badge.id]
                const unlocked = userBadge?.unlocked ?? false
                const progress = userBadge?.progress ?? 0
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    className={`gallery-card p-4 rounded-[22px] border transition-all ${
                      unlocked
                        ? 'border-oasis-500/30 bg-surface-raised/80'
                        : 'border-border/70 bg-surface-raised/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`relative shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${badge.gradient} ${
                        unlocked ? 'shadow-sm' : 'opacity-50 saturate-50'
                      }`}>
                        <badge.Icon size={20} className="text-white" strokeWidth={1.8} />
                        {unlocked && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-oasis-400 flex items-center justify-center shadow-xs">
                            <Sparkles size={8} className="text-surface" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-display text-[13px] ${
                            unlocked ? 'text-text-primary' : 'text-text-muted'
                          }`}>
                            {badge.name}
                          </span>
                          {!unlocked && <Lock size={11} className="text-text-muted shrink-0" />}
                        </div>
                        <p className="font-body text-[11px] text-text-muted mt-0.5 leading-snug">
                          {badge.description}
                        </p>
                        {!unlocked && (
                          <div className="mt-2.5">
                            <div className="flex justify-between mb-1 text-[10px] text-text-muted font-mono">
                              <span>progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-surface-overlay rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full rounded-full bg-oasis-400/80"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="gallery-card p-5 rounded-[26px] border border-border">
            <span className="gallery-label text-text-primary block mb-3.5">weekly points activity</span>
            {dailyPoints.every(v => v === 0) ? (
              <SkeletonBarChart />
            ) : (
              <WeeklyChart data={dailyPoints} />
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

function MetricCard({ icon, value, unit, label, delay }: {
  icon: React.ReactNode
  value: string
  unit: string
  label: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="gallery-card min-h-32 p-4 rounded-[22px] border border-border flex flex-col justify-between"
    >
      <div>{icon}</div>
      <div>
        <span className="block font-display text-[24px] text-text-primary leading-tight">{value}</span>
        <span className="font-mono text-[10px] text-text-muted">{unit}</span>
      </div>
      <span className="gallery-label text-text-muted">{label}</span>
    </motion.div>
  )
}

function WeeklyChart({ data }: { data: number[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const max = Math.max(...data, 1)
  const hasData = data.some(v => v > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="font-body text-[11px] text-text-muted">no action recorded this week</p>
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-2.5 h-24 pt-2">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((val / max) * 100, 8)}%` }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
            className={`w-full rounded-lg ${
              i === data.length - 1
                ? 'bg-gradient-to-t from-oasis-500 to-oasis-400'
                : 'bg-surface-overlay'
            }`}
          />
          <span className="font-mono text-[9px] text-text-muted">{days[i]}</span>
        </div>
      ))}
    </div>
  )
}
