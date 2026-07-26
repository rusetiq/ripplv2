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
  { id: 'b1', name: 'First Ripple', description: 'Log your first action', Icon: CheckCircle2, gradient: 'from-oasis-400 to-gulf-400', glowColor: 'rgba(94, 206, 156, 0.3)' },
  { id: 'b2', name: 'Metro Master', description: '10 metro commutes', Icon: Train, gradient: 'from-gulf-400 to-oasis-500', glowColor: 'rgba(74, 179, 217, 0.3)' },
  { id: 'b3', name: 'Oasis Keeper', description: 'Save 1,000L of water', Icon: Droplets, gradient: 'from-gulf-300 to-gulf-500', glowColor: 'rgba(154, 214, 237, 0.3)' },
  { id: 'b4', name: 'Solar Pioneer', description: 'Log 5 solar energy days', Icon: Sun, gradient: 'from-dune-400 to-ember-400', glowColor: 'rgba(217, 182, 104, 0.3)' },
  { id: 'b5', name: 'Net Zero Hero', description: 'Offset 500 kg CO₂', Icon: Globe, gradient: 'from-oasis-500 to-gulf-400', glowColor: 'rgba(62, 157, 115, 0.3)' },
  { id: 'b6', name: 'Desert Bloom', description: '30-day streak', Icon: Flower, gradient: 'from-oasis-300 to-dune-400', glowColor: 'rgba(156, 221, 182, 0.3)' },
  { id: 'b7', name: 'Carbon Crusher', description: 'Offset 1,000 kg CO₂', Icon: Shield, gradient: 'from-ember-400 to-dune-500', glowColor: 'rgba(217, 119, 86, 0.3)' },
  { id: 'b8', name: 'UAE Champion', description: 'Reach top 10 UAE rank', Icon: Trophy, gradient: 'from-dune-300 to-dune-500', glowColor: 'rgba(237, 214, 154, 0.3)' },
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
      className="px-4 pb-4"
    >
      <div className="mb-5 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">YOUR IMPACT</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">cumulative sustainability metrics</p>
      </div>

      <div className="relative bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-5 mb-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-oasis-400/[0.04] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-oasis-400" />
          <span className="font-body text-[11px] font-semibold text-text-primary tracking-wide">NET ZERO 2050 CONTRIBUTION</span>
        </div>
        <div className="relative h-2.5 bg-surface-overlay rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${netZeroProgress}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-oasis-500 via-oasis-400 to-gulf-400"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[10px] text-oasis-400">{co2Saved.toFixed(1)} kg CO₂</span>
          <span className="font-mono text-[10px] text-text-muted">{netZeroTarget} kg goal</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
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
              label="Avoided"
              delay={0.1}
            />
            <MetricCard
              icon={<Droplets size={16} className="text-gulf-300" />}
              value={`${(waterSaved / 1000).toFixed(1)}k`}
              unit="liters"
              label="Water Saved"
              delay={0.2}
            />
            <MetricCard
              icon={<TreePine size={16} className="text-oasis-500" />}
              value={treesEquivalent}
              unit="trees"
              label="Equivalent"
              delay={0.3}
            />
          </>
        )}
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LogIn size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Sign in to track your impact</p>
          <p className="font-mono text-[10px] text-text-muted mb-6 max-w-[240px]">
            See your CO₂ savings, water conservation, and badge progress.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-2 bg-surface-raised hover:bg-surface-overlay border border-border rounded-xl px-5 py-2.5 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-body text-[13px] text-text-primary">Sign in with Google</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-dune-400" />
                <span className="font-body text-[12px] font-semibold text-text-primary">Badges</span>
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                {unlockedCount}/{badgeDefs.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {!userData?.points && !userData?.badges ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonBadgeCard key={i} />)
              ) : badgeDefs.map((badge, i) => {
                const userBadge = userBadges[badge.id]
                const unlocked = userBadge?.unlocked ?? false
                const progress = userBadge?.progress ?? 0
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                    className="relative group"
                  >
                    <div className={`relative p-3.5 rounded-xl border overflow-hidden transition-all duration-500 ${
                      unlocked
                        ? 'bg-surface-raised/80 border-oasis-500/30'
                        : 'bg-surface-raised/40 border-border'
                    }`}>
                      {unlocked && (
                        <div
                          className="absolute inset-0 opacity-10 blur-xl"
                          style={{ background: `radial-gradient(circle at 30% 30%, ${badge.glowColor}, transparent 70%)` }}
                        />
                      )}
                      <div className="relative flex items-start gap-3">
                        <div className={`relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${badge.gradient} ${
                          unlocked ? '' : 'opacity-60 saturate-50'
                        }`}>
                          <badge.Icon size={20} className="text-surface" strokeWidth={1.5} />
                          {unlocked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.06, type: 'spring' }}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-oasis-400 flex items-center justify-center"
                            >
                              <Sparkles size={8} className="text-surface" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-body text-[12px] font-semibold ${
                              unlocked ? 'text-text-primary' : 'text-text-muted'
                            }`}>
                              {badge.name}
                            </span>
                          </div>
                          <p className="font-mono text-[8px] text-text-muted mt-0.5">{badge.description}</p>
                          {!unlocked && (
                            <div className="mt-2">
                              <div className="flex justify-between mb-1">
                                <span className="font-mono text-[7px] text-text-muted">Progress</span>
                                <span className="font-mono text-[7px] text-text-muted">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, delay: 0.5 + i * 0.06 }}
                                  className="h-full rounded-full bg-gradient-to-r from-oasis-500/60 to-oasis-400/60"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {!unlocked && (
                          <Lock size={10} className="text-text-muted shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-raised/40 rounded-2xl border border-border p-4">
            <span className="font-body text-[11px] font-semibold text-text-primary block mb-3">Weekly Points</span>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-surface-raised/50 backdrop-blur-sm rounded-xl border border-border p-3 flex flex-col items-center text-center"
    >
      <div className="mb-2">{icon}</div>
      <span className="font-display text-[16px] text-text-primary leading-none">{value}</span>
      <span className="font-mono text-[8px] text-text-muted mt-0.5">{unit}</span>
      <span className="font-mono text-[7px] text-text-muted mt-0.5 uppercase tracking-wider">{label}</span>
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
        <p className="font-mono text-[10px] text-text-muted">No activity this week</p>
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(val / max) * 100}%` }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`w-full rounded-md relative ${
              i === data.length - 1
                ? 'bg-gradient-to-t from-oasis-500 to-oasis-400'
                : 'bg-surface-overlay'
            }`}
          />
          <span className="font-mono text-[8px] text-text-muted">{days[i]}</span>
        </div>
      ))}
    </div>
  )
}
