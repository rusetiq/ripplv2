import { motion, AnimatePresence } from 'framer-motion'
import { Gift, TreePine, Droplets, Zap, Shield, Leaf, ShoppingBag, Recycle, Award, Check, Sparkles, ArrowLeft, Lock, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { doc, updateDoc, arrayUnion, increment as fbIncrement, collection, onSnapshot, orderBy, query } from 'firebase/firestore'

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  level: number
  image: string
  Icon: React.ElementType
  gradient: string
  glowColor: string
  accent: string
  tag: string
}

interface SponsoredReward {
  id: string
  name: string
  subtitle: string
  href: string
  imageUrl: string
  points: number
  badge?: string
  order?: number
}

const REWARD_IMAGES: Record<string, string> = {
  r1: 'https://images.unsplash.com/photo-1568844293986-ca9c5b825c37?auto=format&fit=crop&w=800&q=80',
  r2: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
  r3: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  r4: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  r5: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  r6: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
  r7: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
  r8: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
}

const rewards: Reward[] = [
  { id: 'r1', name: 'Transit Day Pass', description: 'A day of low-carbon local travel with a participating partner', cost: 220, level: 1, image: REWARD_IMAGES.r1, Icon: Recycle, gradient: 'from-oasis-400 to-oasis-500', glowColor: 'rgba(52,211,153,0.18)', accent: 'text-oasis-400', tag: 'Transit' },
  { id: 'r2', name: 'Organic Coffee', description: 'Single cup of specialty organic coffee at partner cafes', cost: 700, level: 1, image: REWARD_IMAGES.r2, Icon: Leaf, gradient: 'from-oasis-300 to-gulf-400', glowColor: 'rgba(103,232,249,0.15)', accent: 'text-gulf-400', tag: 'Food' },
  { id: 'r3', name: 'Plant a Native Tree', description: 'Fund a locally appropriate tree through a restoration partner', cost: 750, level: 2, image: REWARD_IMAGES.r3, Icon: TreePine, gradient: 'from-gulf-400 to-gulf-500', glowColor: 'rgba(34,211,238,0.18)', accent: 'text-gulf-400', tag: 'Planet' },
  { id: 'r4', name: 'Thermal Travel Cup', description: 'Double-walled stainless steel insulated travel mug', cost: 1500, level: 3, image: REWARD_IMAGES.r4, Icon: Droplets, gradient: 'from-gulf-300 to-oasis-400', glowColor: 'rgba(103,232,249,0.18)', accent: 'text-gulf-300', tag: 'Gear' },
  { id: 'r5', name: 'Dining Voucher', description: 'A $15 voucher for a sustainable local food partner', cost: 2000, level: 4, image: REWARD_IMAGES.r5, Icon: ShoppingBag, gradient: 'from-oasis-500 to-oasis-600', glowColor: 'rgba(16,185,129,0.18)', accent: 'text-oasis-500', tag: 'Food' },
  { id: 'r6', name: 'Solar Power Bank', description: 'Compact 10,000 mAh solar charger for mobile devices', cost: 3600, level: 5, image: REWARD_IMAGES.r6, Icon: Zap, gradient: 'from-dune-400 to-ember-400', glowColor: 'rgba(251,191,36,0.18)', accent: 'text-dune-400', tag: 'Tech' },
  { id: 'r7', name: 'Eco Cleaning Kit', description: 'Three zero-plastic concentrated cleaning refill pods', cost: 5000, level: 6, image: REWARD_IMAGES.r7, Icon: Shield, gradient: 'from-oasis-400 to-dune-400', glowColor: 'rgba(52,211,153,0.15)', accent: 'text-oasis-400', tag: 'Home' },
  { id: 'r8', name: 'Premium Plant Pod', description: 'Self-watering seed kit for a home herb garden', cost: 8000, level: 8, image: REWARD_IMAGES.r8, Icon: Sparkles, gradient: 'from-ember-400 to-dune-300', glowColor: 'rgba(251,146,60,0.18)', accent: 'text-ember-400', tag: 'Rare' },
]

const DEFAULT_SPONSORED: SponsoredReward[] = [
  {
    id: 'sp-enova',
    name: 'ENOVA SOLAR',
    subtitle: '200 PTS reward on first install',
    href: 'https://www.enova.com',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    points: 200,
    badge: 'Energy',
    order: 0,
  },
  {
    id: 'sp-lulu',
    name: 'LULU ECO MARKET',
    subtitle: 'Earn on every sustainable purchase',
    href: 'https://www.luluhypermarket.com',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    points: 150,
    badge: 'Grocery',
    order: 1,
  },
]

export function RewardsTab() {
  const { points, user, userData, level, setShowSignIn } = useApp()
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [justRedeemed, setJustRedeemed] = useState(false)
  const [sponsored, setSponsored] = useState<SponsoredReward[]>(DEFAULT_SPONSORED)

  useEffect(() => {
    const q = query(collection(db, 'sponsoredRewards'), orderBy('order', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setSponsored(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SponsoredReward, 'id'>) })))
      }
    }, (error) => console.warn('Unable to load sponsored rewards.', error))
    return unsub
  }, [])

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
    setJustRedeemed(true)
    setTimeout(() => {
      setJustRedeemed(false)
      setSelectedReward(null)
    }, 1800)
  }

  if (!user) {
    return (
      <motion.div
        key="rewards-guest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 pb-4"
      >
        <div className="mb-5 pt-1">
          <p className="font-mono text-[9px] tracking-[0.25em] text-text-muted uppercase mb-1">Rippl</p>
          <h2 className="font-display text-[22px] tracking-[0.15em] text-text-primary uppercase">Rewards</h2>
        </div>

        <div
          className="rounded-3xl border border-border overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #141311 0%, #0d0c0c 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(52,211,153,0.08), transparent 60%)' }}
          />
          <div className="p-8 flex flex-col items-center text-center relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <Gift size={28} className="text-oasis-400" />
            </div>
            <h3 className="font-display text-[16px] tracking-widest text-text-primary mb-2 uppercase">Sign in to Redeem</h3>
            <p className="font-mono text-[10px] text-text-muted mb-6 max-w-[220px] leading-relaxed">
              Trade sustainability points for real‑world eco rewards.
            </p>
            <button
              onClick={() => setShowSignIn(true)}
              className="flex items-center gap-2.5 rounded-xl px-5 py-2.5 transition-all active:scale-95"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-body text-[13px] text-text-primary">Sign in with Google</span>
            </button>
          </div>
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
      className="px-4 pb-6"
    >
      <AnimatePresence mode="wait">
        {selectedReward ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={() => { setSelectedReward(null); setJustRedeemed(false) }}
              className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary mb-5 transition-colors pt-1"
            >
              <ArrowLeft size={13} />
              <span className="font-mono text-[9px] tracking-widest uppercase">Back</span>
            </button>

            <div
              className="rounded-3xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, #141210 0%, #0b0a0a 100%)',
                border: '1px solid rgba(167,154,124,0.1)',
                boxShadow: `0 0 60px ${selectedReward.glowColor}`,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${selectedReward.glowColor}, transparent 55%)` }}
              />

              <div
                className="w-full h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${selectedReward.image}')` }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #141210 100%)' }} />
              </div>

              <div className="p-6 relative z-10 text-center -mt-8">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedReward.gradient} flex items-center justify-center mx-auto mb-4`}
                  style={{ boxShadow: `0 8px 32px ${selectedReward.glowColor}` }}
                >
                  <selectedReward.Icon size={28} className="text-surface" />
                </div>

                <span className="font-mono text-[8px] tracking-[0.3em] text-text-muted uppercase mb-2 block">{selectedReward.tag}</span>
                <h3 className="font-display text-[20px] tracking-wider text-text-primary mb-1 uppercase">{selectedReward.name}</h3>
                <p className="font-mono text-[10px] text-text-muted mb-5 max-w-[240px] mx-auto leading-relaxed">{selectedReward.description}</p>

                <div
                  className="inline-flex flex-col items-center px-8 py-3 rounded-2xl mb-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,154,124,0.1)' }}
                >
                  <span className="font-display text-[38px] text-oasis-400 leading-none">{selectedReward.cost.toLocaleString()}</span>
                  <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase mt-0.5">points required</span>
                </div>
                <div className="mb-6">
                  <span className="font-mono text-[9px] text-text-muted">Level {selectedReward.level} required</span>
                </div>

                {justRedeemed ? (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2 py-3"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
                    >
                      <Check size={22} className="text-oasis-400" />
                    </div>
                    <span className="font-display text-[13px] tracking-widest text-oasis-400 uppercase">Redeemed!</span>
                  </motion.div>
                ) : redeemed.includes(selectedReward.id) ? (
                  <div className="flex items-center justify-center gap-2 text-oasis-400 py-2.5">
                    <Check size={15} />
                    <span className="font-body text-[13px] font-medium">Already redeemed</span>
                  </div>
                ) : level < selectedReward.level ? (
                  <div className="flex flex-col items-center gap-1 py-2">
                    <Lock size={16} className="text-dune-400 mb-1" />
                    <p className="font-mono text-[10px] text-dune-400">Level {selectedReward.level} required</p>
                    <p className="font-mono text-[9px] text-text-muted">You are level {level} — keep going!</p>
                  </div>
                ) : points < selectedReward.cost ? (
                  <div className="flex flex-col items-center gap-1 py-2">
                    <p className="font-mono text-[10px] text-ember-400">Not enough points</p>
                    <p className="font-mono text-[9px] text-text-muted">{(selectedReward.cost - points).toLocaleString()} more needed</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(selectedReward)}
                    disabled={confirming}
                    className="w-full py-3.5 rounded-2xl font-display text-[13px] tracking-[0.15em] uppercase transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                    }}
                  >
                    {confirming ? 'Redeeming…' : 'Redeem Now'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-6 pt-1 flex items-start justify-between">
              <div>
                <p className="gallery-label mb-1.5 text-text-muted">Marketplace</p>
                <h2 className="font-display text-[26px] text-text-primary leading-tight">Rewards</h2>
                <p className="font-body text-[11px] text-text-muted tracking-wide mt-1.5 lowercase">redeem points for a better world</p>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 mt-1 border border-oasis-500/20"
                style={{ background: 'rgba(52,211,153,0.08)' }}
              >
                <Award size={11} className="text-oasis-400" />
                <span className="font-mono text-[10px] text-oasis-400 font-medium">{points.toLocaleString()} pts</span>
              </div>
            </div>

            <div className="mb-3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-text-muted uppercase mb-3">Sponsored</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {sponsored.slice(0, 2).map((sp, i) => (
                  <motion.a
                    key={sp.id}
                    href={sp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="h-52 rounded-[1.6rem] overflow-hidden relative border border-white/[0.07] hover:border-oasis-400/30 transition-all duration-300 block group"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${sp.imageUrl}')` }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(5,10,8,0.97) 0%, rgba(5,10,8,0.45) 50%, transparent 100%)' }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(52,211,153,0.04)' }} />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/50 border border-white/10 font-mono text-[7px] text-text-secondary uppercase tracking-widest">
                        Sponsored
                      </span>
                      {sp.badge && (
                        <span className="px-2 py-0.5 rounded-full font-mono text-[7px] uppercase tracking-widest" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                          {sp.badge}
                        </span>
                      )}
                    </div>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 border border-white/15 font-display text-[7px] text-white/70 tracking-widest uppercase">AD</span>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-[15px] text-white uppercase tracking-[0.04em] leading-tight mb-1 truncate">
                        {sp.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[9px] text-white/55 leading-snug line-clamp-1">{sp.subtitle}</p>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="font-display text-[11px] text-oasis-400">{sp.points}</span>
                          <span className="font-mono text-[7px] text-oasis-400/70 uppercase">pts</span>
                          <ExternalLink size={8} className="text-white/30 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <p className="font-mono text-[9px] tracking-[0.25em] text-text-muted uppercase mb-3">Rewards</p>
            <div className="grid grid-cols-3 gap-2.5">
              {rewards.map((reward, i) => {
                const own = redeemed.includes(reward.id)
                const unlocked = level >= reward.level

                return (
                  <motion.button
                    key={reward.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 + 0.12, duration: 0.22 }}
                    onClick={() => unlocked && setSelectedReward(reward)}
                    disabled={!unlocked}
                    className="h-36 rounded-[1.2rem] overflow-hidden relative border border-white/[0.07] hover:border-oasis-400/25 transition-all duration-300 block group text-left cursor-pointer disabled:opacity-40"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${reward.image}')` }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(5,10,8,0.98) 0%, rgba(5,10,8,0.4) 55%, transparent 100%)' }}
                    />

                    {own ? (
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-oasis-500/25 border border-oasis-400/40 flex items-center justify-center">
                        <Check size={9} className="text-oasis-400" />
                      </span>
                    ) : !unlocked ? (
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
                        <Lock size={8} className="text-text-muted" />
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/40 border border-white/5 font-mono text-[6px] text-text-secondary uppercase tracking-widest">
                        {reward.tag}
                      </span>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <h3 className="font-display text-[10px] text-white uppercase tracking-[0.03em] leading-tight mb-0.5 truncate">
                        {reward.name}
                      </h3>
                      <p className="font-mono text-[8px] text-white/60 uppercase">
                        {reward.cost.toLocaleString()}pts
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
