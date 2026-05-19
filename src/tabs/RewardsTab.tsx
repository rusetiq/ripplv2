import { motion } from 'framer-motion'
import { Gift, TreePine, Droplets, Zap, Shield, Leaf, ShoppingBag, Recycle, Award, Check, Sparkles, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { doc, updateDoc, arrayUnion, increment as fbIncrement } from 'firebase/firestore'

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  level: number
  image: string
  Icon: React.ElementType
  gradient: string
  color: string
}

const rewards: Reward[] = [
  { id: 'r1', name: 'Metro Day Pass Voucher', description: 'One full day of unlimited travel on the Dubai Metro', cost: 220, level: 1, image: '', Icon: Recycle, gradient: 'from-oasis-400 to-oasis-500', color: 'text-oasis-400' },
  { id: 'r2', name: 'Specialty Organic Coffee', description: 'Single cup of organic coffee at partnering cafes', cost: 700, level: 1, image: '', Icon: Leaf, gradient: 'from-oasis-300 to-gulf-400', color: 'text-oasis-300' },
  { id: 'r3', name: 'Plant a Mangrove Tree', description: 'One native mangrove planted in the UAE', cost: 750, level: 2, image: '', Icon: TreePine, gradient: 'from-gulf-400 to-gulf-500', color: 'text-gulf-400' },
  { id: 'r4', name: 'Reusable Thermal Cup', description: 'Double-walled stainless steel insulated travel mug', cost: 1500, level: 3, image: '', Icon: Droplets, gradient: 'from-gulf-300 to-oasis-400', color: 'text-gulf-300' },
  { id: 'r5', name: 'Sustainable Dining Voucher', description: 'Fifty AED voucher for certified organic local cafes', cost: 2000, level: 4, image: '', Icon: ShoppingBag, gradient: 'from-oasis-500 to-oasis-600', color: 'text-oasis-500' },
  { id: 'r6', name: 'Solar Power Bank', description: 'Compact ten thousand mAh solar charger for mobile devices', cost: 3600, level: 5, image: '', Icon: Zap, gradient: 'from-dune-400 to-ember-400', color: 'text-dune-400' },
  { id: 'r7', name: 'Eco-Friendly Cleaning Kit', description: 'Set of three zero-plastic concentrated cleaning refills', cost: 5000, level: 6, image: '', Icon: Shield, gradient: 'from-oasis-400 to-dune-400', color: 'text-oasis-400' },
  { id: 'r8', name: 'Premium Plant Pod Set', description: 'Self-watering seed pod kit for home herb gardens', cost: 8000, level: 8, image: '', Icon: Sparkles, gradient: 'from-ember-400 to-dune-300', color: 'text-ember-400' },
]

export function RewardsTab() {
  const { points, user, userData, level, setShowSignIn } = useApp()
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirming, setConfirming] = useState(false)

  const redeemed = userData?.redeemedRewards || []

  const handleRedeem = async (reward: Reward) => {
    if (!user) return
    if (points < reward.cost) return
    if (level < reward.level) return
    if (redeemed.includes(reward.id)) return
    setConfirming(true)
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      points: fbIncrement(-reward.cost),
      redeemedRewards: arrayUnion(reward.id),
    })
    setConfirming(false)
    setSelectedReward(null)
  }

  if (!user) {
    return (
      <motion.div
        key="rewards"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-4"
      >
        <div className="mb-5 pt-1">
          <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">REWARDS</h2>
          <p className="font-mono text-[10px] text-text-muted mt-0.5">redeem points for a better world</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gift size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Sign in to redeem rewards</p>
          <p className="font-mono text-[10px] text-text-muted mb-6 max-w-[240px]">
            Trade your sustainability points for real-world eco rewards.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-2 bg-surface-raised hover:bg-surface-overlay border border-border rounded-xl px-5 py-2.5 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            <span className="font-body text-[13px] text-text-primary">Sign in with Google</span>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="rewards"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4"
    >
      <div className="mb-3 pt-1 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">REWARDS</h2>
          <p className="font-mono text-[10px] text-text-muted mt-0.5">redeem points for a better world</p>
        </div>
        <div className="flex items-center gap-1.5 bg-oasis-500/10 rounded-full px-3 py-1.5">
          <Award size={12} className="text-oasis-400" />
          <span className="font-mono text-[10px] text-oasis-400 font-medium">{points.toLocaleString()} pts</span>
        </div>
      </div>

      {selectedReward ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button onClick={() => setSelectedReward(null)} className="flex items-center gap-1 text-text-muted hover:text-text-secondary mb-4 transition-colors">
            <ArrowLeft size={14} />
            <span className="font-mono text-[9px]">Back to rewards</span>
          </button>

          <div className={`rounded-2xl border border-border bg-surface-raised/60 backdrop-blur-sm p-6 text-center`}>
            {selectedReward.image ? (
              <img src={selectedReward.image} alt={selectedReward.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4" />
            ) : (
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedReward.gradient} flex items-center justify-center mx-auto mb-4`}>
                <selectedReward.Icon size={28} className="text-surface" />
              </div>
            )}
            <h3 className="font-body text-[16px] font-bold text-text-primary mb-1">{selectedReward.name}</h3>
            <p className="font-mono text-[10px] text-text-muted mb-4">{selectedReward.description}</p>
            <div className="text-center mb-5">
              <span className="font-display text-[32px] text-oasis-400">{selectedReward.cost.toLocaleString()}</span>
              <span className="font-mono text-[11px] text-text-muted ml-1">pts</span>
              <div className="mt-1">
                <span className="font-mono text-[9px] text-text-muted">Requires level {selectedReward.level}</span>
              </div>
            </div>

            {redeemed.includes(selectedReward.id) ? (
              <div className="flex items-center justify-center gap-1.5 text-oasis-400 py-2.5">
                <Check size={16} />
                <span className="font-body text-[13px] font-medium">Redeemed</span>
              </div>
            ) : level < selectedReward.level ? (
              <div className="text-center">
                <p className="font-mono text-[10px] text-dune-400 mb-1">Level {selectedReward.level} required</p>
                <p className="font-mono text-[9px] text-text-muted">You are level {level} - keep going!</p>
              </div>
            ) : points < selectedReward.cost ? (
              <div className="text-center">
                <p className="font-mono text-[10px] text-red-400 mb-1">Not enough points</p>
                <p className="font-mono text-[9px] text-text-muted">You need {(selectedReward.cost - points).toLocaleString()} more points</p>
              </div>
            ) : (
              <button
                onClick={() => handleRedeem(selectedReward)}
                disabled={confirming}
                className="w-full bg-oasis-500 hover:bg-oasis-600 disabled:opacity-50 text-surface rounded-xl py-2.5 font-body text-[13px] font-medium transition-colors"
              >
                {confirming ? 'Redeeming...' : 'Redeem now'}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward, i) => {
            const own = redeemed.includes(reward.id)
            const affordable = points >= reward.cost
            const unlocked = level >= reward.level
            return (
              <motion.button
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => unlocked && setSelectedReward(reward)}
                disabled={!unlocked}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${own
                  ? 'bg-oasis-500/10 border-oasis-500/30'
                  : affordable && unlocked
                    ? 'bg-surface-raised/50 border-border hover:border-border-active'
                    : 'bg-surface-raised/30 border-border opacity-60 cursor-default'
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reward.gradient} flex items-center justify-center ${!unlocked && 'opacity-50'}`}>
                  <reward.Icon size={26} className="text-surface" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-body text-[13px] font-semibold ${own ? 'text-oasis-400' : unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                    {reward.name}
                  </p>
                  <p className="font-mono text-[11px] text-text-muted mt-1">{reward.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-mono text-[11px] text-text-muted">{reward.cost.toLocaleString()} pts</p>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-text-muted">Requires level {reward.level}</p>
                      {own && <p className="font-mono text-[11px] text-oasis-400">Redeemed</p>}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}

          <motion.a
            href="https://www.enova.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rewards.length * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-dune-400/20 bg-gradient-to-br from-dune-400/5 to-transparent hover:border-dune-400/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <span className="font-mono text-[8px] text-text-muted uppercase tracking-widest bg-surface-overlay px-1.5 py-0.5 rounded-full">Ad</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dune-400 to-ember-400 flex items-center justify-center shrink-0">
              <Zap size={26} className="text-surface" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-body text-[13px] font-semibold text-text-primary">Go Solar This Summer</p>
              <p className="font-mono text-[11px] text-text-muted mt-1">Home solar plans from 299 AED per month</p>
              <p className="font-mono text-[10px] text-dune-400 mt-2">Sponsored by Enova</p>
            </div>
          </motion.a>

          <motion.a
            href="https://www.luluhypermarket.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (rewards.length + 1) * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-oasis-400/20 bg-gradient-to-br from-oasis-400/5 to-transparent hover:border-oasis-400/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <span className="font-mono text-[8px] text-text-muted uppercase tracking-widest bg-surface-overlay px-1.5 py-0.5 rounded-full">Ad</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-oasis-400 to-gulf-400 flex items-center justify-center shrink-0">
              <ShoppingBag size={26} className="text-surface" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-body text-[13px] font-semibold text-text-primary">Eco Aisle at Lulu</p>
              <p className="font-mono text-[11px] text-text-muted mt-1">Sustainable groceries delivered same-day</p>
              <p className="font-mono text-[10px] text-oasis-400 mt-2">Sponsored by Lulu Hypermarket</p>
            </div>
          </motion.a>
        </div>
      )}
    </motion.div>
  )
}
