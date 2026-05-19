import { motion } from 'framer-motion'
import { Check, Zap, Crown, ArrowRight, Shield, Leaf, Star, Sparkles } from 'lucide-react'
import { useApp } from '../App'

const freeFeatures = [
  'Unlimited action logging',
  'AI photo verification',
  'Community leaderboard',
  'Basic rewards access',
  'Personal impact dashboard',
  'Community feed',
]

const premiumFeatures = [
  { label: 'Advanced ESG Data Insights', icon: Zap },
  { label: 'Exclusive Premium Rewards', icon: Star },
  { label: 'Custom Profile Badges', icon: Sparkles },
  { label: 'Unlimited AI Verifications', icon: Shield },
  { label: 'Early Access to New Features', icon: Crown },
  { label: 'Ad-Free Experience', icon: Leaf },
  { label: 'Priority Support', icon: Shield },
  { label: 'Downloadable Impact Reports', icon: Zap },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function PricingTab() {
  const { } = useApp()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="px-4 pb-24"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="pt-1 mb-6"
      >
        <motion.p variants={itemVariants} className="font-mono text-[9px] tracking-[0.25em] text-text-muted uppercase mb-0.5">
          Rippl
        </motion.p>
        <motion.h1 variants={itemVariants} className="font-display text-[28px] tracking-[0.1em] text-text-primary uppercase leading-tight">
          Choose Your Plan
        </motion.h1>
        <motion.p variants={itemVariants} className="font-mono text-[10px] text-text-muted mt-1">
          Simple, transparent pricing — no hidden fees.
        </motion.p>
      </motion.div>

      {/* Premium Card — hero treatment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden mb-4"
        style={{
          background: 'linear-gradient(145deg, #131f18 0%, #0c1a12 60%, #0a1510 100%)',
          border: '1px solid rgba(52,211,153,0.22)',
          boxShadow: '0 0 80px rgba(52,211,153,0.1), 0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Glow blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-40px', right: '-40px',
            width: '180px', height: '180px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(52,211,153,0.18), transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '0', left: '-20px',
            width: '120px', height: '120px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* Shimmer top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)' }}
        />

        <div className="relative z-10 p-5">
          {/* Badge row */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <Star size={9} className="text-oasis-400 fill-oasis-400" />
              <span className="font-mono text-[8px] tracking-[0.2em] text-oasis-400 uppercase font-bold">Most Popular</span>
            </div>
            <Crown size={20} className="text-oasis-400/25" />
          </div>

          {/* Price block */}
          <div className="mb-5">
            <p className="font-mono text-[10px] tracking-widest text-text-muted uppercase mb-2">Rippl Premium</p>
            <div className="flex items-end gap-1.5">
              <span className="font-display text-[52px] text-text-primary leading-none">15</span>
              <div className="flex flex-col mb-1.5">
                <span className="font-display text-[18px] text-oasis-400">AED</span>
                <span className="font-mono text-[10px] text-text-muted">/ month</span>
              </div>
            </div>
            <p className="font-mono text-[10px] text-text-muted mt-2 italic leading-relaxed">
              Support the planet and unlock your full impact potential.
            </p>
          </div>

          {/* Features list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2.5 mb-6"
          >
            {premiumFeatures.map(({ label }, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
                >
                  <Check size={9} className="text-oasis-400" />
                </div>
                <span className="font-body text-[12px] text-text-primary">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <button
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display text-[13px] tracking-[0.15em] uppercase transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 28px rgba(16,185,129,0.35)',
            }}
          >
            Upgrade to Premium
            <ArrowRight size={14} />
          </button>

          <p className="font-mono text-[8px] text-text-muted text-center mt-3 tracking-wide">
            Secure checkout · Cancel anytime
          </p>
        </div>
      </motion.div>

      {/* Free Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-3xl p-5 mb-4"
        style={{
          background: 'rgba(17,25,22,0.6)',
          border: '1px solid rgba(167,154,124,0.1)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-text-muted uppercase mb-1">Current Plan</p>
            <p className="font-body text-[15px] font-bold text-text-primary">Free</p>
            <p className="font-mono text-[10px] text-text-muted">For individuals getting started</p>
          </div>
          <div className="text-right">
            <span className="font-display text-[28px] text-text-secondary leading-none">0</span>
            <span className="font-mono text-[11px] text-text-muted ml-1">AED</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          {freeFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(167,154,124,0.1)', border: '1px solid rgba(167,154,124,0.15)' }}
              >
                <Check size={8} className="text-text-muted" />
              </div>
              <span className="font-body text-[11px] text-text-secondary leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(167,154,124,0.08)' }}
        >
          <Leaf size={12} className="text-oasis-400 shrink-0" />
          <p className="font-mono text-[9px] text-text-muted leading-relaxed">
            Ads help fund our UAE mangrove planting program.
          </p>
        </div>
      </motion.div>

      {/* Impact Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'rgba(17,25,22,0.6)', border: '1px solid rgba(167,154,124,0.1)' }}
        >
          <div
            className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, rgba(103,232,249,0.08), transparent 70%)' }}
          />
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)' }}
          >
            <Star size={13} className="text-gulf-400" />
          </div>
          <h4 className="font-body text-[11px] font-bold text-text-primary mb-1">Community Impact</h4>
          <p className="font-mono text-[9px] text-text-muted leading-relaxed">10% of revenue goes directly to UAE reforestation projects.</p>
        </div>

        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'rgba(17,25,22,0.6)', border: '1px solid rgba(167,154,124,0.1)' }}
        >
          <div
            className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, rgba(251,191,36,0.08), transparent 70%)' }}
          />
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <Zap size={13} className="text-dune-400" />
          </div>
          <h4 className="font-body text-[11px] font-bold text-text-primary mb-1">Direct Offset</h4>
          <p className="font-mono text-[9px] text-text-muted leading-relaxed">Auto-offset 20 kg of CO₂ per month with your subscription.</p>
        </div>
      </motion.div>

      {/* Enterprise Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.38 }}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'rgba(17,25,22,0.5)',
          border: '1px solid rgba(167,154,124,0.1)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 90% 50%, rgba(52,211,153,0.04), transparent 60%)' }}
        />
        <div className="flex items-start gap-3 relative z-10">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(167,154,124,0.08)', border: '1px solid rgba(167,154,124,0.12)' }}
          >
            <Shield size={14} className="text-text-muted" />
          </div>
          <div>
            <p className="font-body text-[12px] font-bold text-text-primary mb-1">Enterprise Plans Available</p>
            <p className="font-mono text-[9px] text-text-muted leading-relaxed">
              Team-wide ESG tracking, consolidated reporting, and Scope 3 analytics.
              Per-seat pricing with volume discounts and a 30-day pilot for qualifying teams.
            </p>
            <button
              className="mt-2.5 flex items-center gap-1 font-mono text-[9px] text-oasis-400 tracking-widest uppercase transition-opacity hover:opacity-70"
            >
              Contact Sales <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
