import { motion, AnimatePresence } from 'framer-motion'
import { Gift, TreePine, Droplets, Zap, Shield, Leaf, ShoppingBag, Recycle, Award, Check, Sparkles, ArrowLeft, Lock, ExternalLink, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { doc, updateDoc, arrayUnion, increment as fbIncrement, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { DotNumber } from '../components/DotNumber'

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

const DEFAULT_SPONSORED: SponsoredReward[] = [
  {
    id: 'sp-enova',
    name: 'Enova Solar Energy',
    subtitle: 'Earn 200 pts bonus on home solar installation',
    href: 'https://www.enova.com',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    points: 200,
    badge: 'Clean Energy',
    order: 0,
  },
  {
    id: 'sp-lulu',
    name: 'Lulu Eco Market',
    subtitle: 'Get points on every package-free sustainable purchase',
    href: 'https://www.luluhypermarket.com',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    points: 150,
    badge: 'Zero Waste',
    order: 1,
  },
]

const SPONSORED_FALLBACKS = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  '/assets/sustainability-icons-v2/solar-energy.png',
  '/assets/sustainability-icons-v2/earth-leaf.png',
]

const rewards: Reward[] = [
  { id: 'r1', name: 'Transit Day Pass', description: 'A day of low-carbon local travel with a participating transit partner', cost: 220, level: 1, image: REWARD_IMAGES.r1, Icon: Recycle, gradient: 'from-oasis-400 to-oasis-500', glowColor: 'rgba(52,211,153,0.18)', accent: 'text-oasis-400', tag: 'Transit' },
  { id: 'r2', name: 'Organic Coffee', description: 'Single cup of specialty fair-trade organic coffee at partner cafes', cost: 700, level: 1, image: REWARD_IMAGES.r2, Icon: Leaf, gradient: 'from-oasis-300 to-gulf-400', glowColor: 'rgba(103,232,249,0.15)', accent: 'text-gulf-400', tag: 'Food' },
  { id: 'r3', name: 'Plant a Native Tree', description: 'Fund a locally appropriate tree through an active restoration partner', cost: 750, level: 2, image: REWARD_IMAGES.r3, Icon: TreePine, gradient: 'from-gulf-400 to-gulf-500', glowColor: 'rgba(34,211,238,0.18)', accent: 'text-gulf-400', tag: 'Planet' },
  { id: 'r4', name: 'Thermal Travel Cup', description: 'Double-walled stainless steel insulated reusable travel mug', cost: 1500, level: 3, image: REWARD_IMAGES.r4, Icon: Droplets, gradient: 'from-gulf-300 to-oasis-400', glowColor: 'rgba(103,232,249,0.18)', accent: 'text-gulf-300', tag: 'Gear' },
  { id: 'r5', name: 'Dining Voucher', description: 'A $15 voucher for an accredited sustainable local food kitchen', cost: 2000, level: 4, image: REWARD_IMAGES.r5, Icon: ShoppingBag, gradient: 'from-oasis-500 to-oasis-600', glowColor: 'rgba(16,185,129,0.18)', accent: 'text-oasis-500', tag: 'Food' },
  { id: 'r6', name: 'Solar Power Bank', description: 'Compact 10,000 mAh solar charger for clean mobile charging', cost: 3600, level: 5, image: REWARD_IMAGES.r6, Icon: Zap, gradient: 'from-dune-400 to-ember-400', glowColor: 'rgba(251,191,36,0.18)', accent: 'text-dune-400', tag: 'Tech' },
  { id: 'r7', name: 'Eco Cleaning Kit', description: 'Three zero-plastic concentrated cleaning refill pods and dispenser', cost: 5000, level: 6, image: REWARD_IMAGES.r7, Icon: Shield, gradient: 'from-oasis-400 to-dune-400', glowColor: 'rgba(52,211,153,0.15)', accent: 'text-oasis-400', tag: 'Home' },
  { id: 'r8', name: 'Premium Plant Pod', description: 'Self-watering seed kit for a thriving home culinary herb garden', cost: 8000, level: 8, image: REWARD_IMAGES.r8, Icon: Sparkles, gradient: 'from-ember-400 to-dune-300', glowColor: 'rgba(251,146,60,0.18)', accent: 'text-ember-400', tag: 'Rare' },
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
        const list = snap.docs.map((d, index) => {
          const item = d.data() as Omit<SponsoredReward, 'id'>
          const fallback = SPONSORED_FALLBACKS[index % SPONSORED_FALLBACKS.length]
          return {
            id: d.id,
            ...item,
            imageUrl: item.imageUrl && item.imageUrl.trim().length > 5 ? item.imageUrl : fallback,
          }
        })
        setSponsored(list)
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
        transition={{ duration: 0.2 }}
        className="px-4 pb-8 md:px-0"
      >
        <div className="mb-5 pt-1">
          <p className="gallery-label mb-1.5 text-text-muted">marketplace</p>
          <h2 className="font-display text-[26px] leading-tight text-text-primary">rewards</h2>
          <p className="mt-1 text-[13px] text-text-muted">trade sustainability points for real-world eco perks</p>
        </div>

        <div className="expressive-card aurora-card p-10 flex flex-col items-center text-center rounded-[34px] shadow-lg mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
            <Gift size={28} strokeWidth={1.8} />
          </div>
          <h3 className="font-display text-[22px] text-white mb-2">sign in to redeem perks</h3>
          <p className="font-body text-[13px] text-white/90 mb-6 max-w-[320px] leading-relaxed">
            every sustainable habit earns you points you can convert into tangible vouchers, transit passes, and gear.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-body text-[13px] font-medium shadow-md hover:bg-white/90 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>continue with google</span>
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
      className="px-4 pb-12 md:px-0"
    >
      <AnimatePresence mode="wait">
        {selectedReward ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <button
              onClick={() => { setSelectedReward(null); setJustRedeemed(false) }}
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary mb-4 transition-colors pt-1"
            >
              <ArrowLeft size={15} />
              <span className="font-body text-[12px]">back to rewards</span>
            </button>

            <div className="expressive-card forest-card rounded-[34px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 bg-black/30 border border-white/20">
                <img
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  onError={(e) => { e.currentTarget.src = '/assets/plates/meal-evidence.png' }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                  {selectedReward.tag.toLowerCase()}
                </span>
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md font-mono text-[11px] text-white border border-white/20">
                  level {selectedReward.level} required
                </span>
              </div>

              <div className="max-w-xl mx-auto text-center">
                <h3 className="font-display text-[26px] text-white mb-2 leading-tight">
                  {selectedReward.name.toLowerCase()}
                </h3>
                <p className="font-body text-[14px] text-white/85 mb-6 leading-relaxed">
                  {selectedReward.description}
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-6 text-white">
                  <Award size={16} />
                  <DotNumber value={selectedReward.cost.toLocaleString()} className="text-white fill-white h-5" />
                  <span className="font-body text-[12px] opacity-80">points</span>
                </div>

                <div>
                  {justRedeemed ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-body text-[13px] font-medium shadow-md"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>reward redeemed! voucher sent to your profile</span>
                    </motion.div>
                  ) : redeemed.includes(selectedReward.id) ? (
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                      <Check size={16} />
                      <span className="font-body text-[13px] font-medium">already redeemed</span>
                    </div>
                  ) : level < selectedReward.level ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20">
                        <Lock size={14} />
                        <span className="font-body text-[12px]">level {selectedReward.level} required (you are level {level})</span>
                      </div>
                    </div>
                  ) : points < selectedReward.cost ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <span className="font-body text-[12px] text-white/90 bg-black/30 px-4 py-1.5 rounded-full border border-white/15">
                        need {(selectedReward.cost - points).toLocaleString()} more points
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeem(selectedReward)}
                      disabled={confirming}
                      className="w-full max-w-sm mx-auto py-3.5 rounded-full bg-white text-black font-body text-[14px] font-medium shadow-lg hover:bg-white/95 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{confirming ? 'redeeming...' : 'confirm redemption'}</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="expressive-card sapphire-card p-6 md:p-8 rounded-[34px] mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-body text-[11px] text-white/80 uppercase tracking-wider">sustainable marketplace</span>
                  <h2 className="font-display text-[30px] text-white leading-tight mt-0.5">rewards catalog</h2>
                  <p className="font-body text-[13px] text-white/85 mt-1">redeem your verified eco habits for exclusive real-world perks.</p>
                </div>
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white shrink-0 self-start md:self-auto">
                  <Award size={18} />
                  <div className="flex items-baseline gap-1.5">
                    <DotNumber value={points.toLocaleString()} className="text-white fill-white h-6" />
                    <span className="font-body text-[11px] text-white/80">pts available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <p className="gallery-label text-text-muted">partner initiatives</p>
                <span className="font-body text-[11px] text-text-muted">featured brand campaigns</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sponsored.slice(0, 2).map((sp, i) => {
                  const cardGradientClass = i === 0 ? 'solar-card' : 'aurora-card'
                  const fallbackImage = SPONSORED_FALLBACKS[i % SPONSORED_FALLBACKS.length]
                  return (
                    <motion.a
                      key={sp.id}
                      href={sp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`expressive-card ${cardGradientClass} rounded-[30px] overflow-hidden group p-6 flex flex-col justify-between min-h-[220px] shadow-lg cursor-pointer transition-all hover:shadow-xl`}
                    >
                      <img
                        src={sp.imageUrl || fallbackImage}
                        alt={sp.name}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage
                        }}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-45 group-hover:scale-105 group-hover:opacity-55 transition-all duration-500 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-body text-[10px] font-medium border border-white/20">
                            partner ad
                          </span>
                          {sp.badge && (
                            <span className="px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white font-body text-[10px] font-medium border border-white/20">
                              {sp.badge.toLowerCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[12px] font-semibold text-white px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                          +{sp.points} pts
                        </span>
                      </div>

                      <div className="relative z-10 pt-10">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-[20px] text-white leading-tight">
                            {sp.name}
                          </h3>
                          <ExternalLink size={15} className="text-white/80 shrink-0 group-hover:text-white transition-colors" />
                        </div>
                        <p className="font-body text-[13px] text-white/90 mt-1 line-clamp-2 leading-relaxed">
                          {sp.subtitle}
                        </p>
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3.5">
              <p className="gallery-label text-text-muted">community rewards</p>
              <span className="font-body text-[11px] text-text-muted">level {level} unlocked</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {rewards.map((reward, i) => {
                const own = redeemed.includes(reward.id)
                const unlocked = level >= reward.level
                const affordable = points >= reward.cost

                return (
                  <motion.button
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => unlocked && setSelectedReward(reward)}
                    disabled={!unlocked}
                    className={`gallery-card rounded-[26px] border border-border/70 overflow-hidden text-left flex flex-col p-3.5 transition-all duration-200 group relative ${
                      !unlocked
                        ? 'opacity-50 cursor-not-allowed bg-surface-raised/40'
                        : 'hover:border-border-active hover:-translate-y-1 hover:shadow-md bg-surface-raised/70'
                    }`}
                  >
                    <div className="relative h-32 w-full rounded-[20px] overflow-hidden bg-surface-overlay/40 mb-3">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        onError={(e) => { e.currentTarget.src = '/assets/plates/meal-evidence.png' }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {own ? (
                          <span className="w-6 h-6 rounded-full bg-oasis-500 text-white flex items-center justify-center shadow-sm">
                            <Check size={12} strokeWidth={2.8} />
                          </span>
                        ) : !unlocked ? (
                          <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                            <Lock size={11} />
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[10px] font-medium border border-white/10">
                            {reward.tag.toLowerCase()}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 font-mono text-[10px] text-white bg-black/55 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                        lv {reward.level}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between px-1 pb-1">
                      <div>
                        <h4 className="font-display text-[14px] text-text-primary leading-tight truncate">
                          {reward.name.toLowerCase()}
                        </h4>
                        <p className="font-body text-[11px] text-text-muted line-clamp-1 mt-0.5">
                          {reward.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-border/50">
                        <span className="font-mono text-[12px] font-semibold text-text-primary">
                          {reward.cost.toLocaleString()} pts
                        </span>
                        {own ? (
                          <span className="font-body text-[10px] text-oasis-400 font-medium">claimed</span>
                        ) : !unlocked ? (
                          <span className="font-body text-[10px] text-text-muted">locked</span>
                        ) : (
                          <span className={`font-body text-[10px] font-medium ${affordable ? 'text-oasis-400' : 'text-text-muted'}`}>
                            {affordable ? 'ready' : 'save up'}
                          </span>
                        )}
                      </div>
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
