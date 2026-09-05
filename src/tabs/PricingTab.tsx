import { motion } from 'framer-motion'
import { Check, Crown, ArrowRight, Shield, Leaf, Star, Zap } from 'lucide-react'
import { useApp } from '../App'

const freeFeatures = [
  'unlimited action logging',
  'ai photo verification',
  'community leaderboard access',
  'community rewards redemption',
  'personal impact dashboard',
  'community public feed',
]

const premiumFeatures = [
  'advanced esg data insights',
  'exclusive premium partner perks',
  'custom profile verification badges',
  'unlimited priority ai verifications',
  'early access to new platform features',
  'ad-free browsing experience',
  'priority community support',
  'downloadable certified impact certificates',
]

export function PricingTab() {
  const { setActiveTab } = useApp()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-12 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">membership</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">choose your plan</h2>
        <p className="mt-1 text-[13px] text-text-muted">simple, transparent support for collective sustainability.</p>
      </div>

      <div className="gallery-card rounded-[30px] border border-border overflow-hidden p-6 md:p-8 mb-5 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full bg-[#d5e0eb] text-[#253b54] font-body text-[11px] font-medium">
            most popular
          </span>
          <Crown size={20} className="text-oasis-400" />
        </div>

        <div className="mb-6">
          <p className="gallery-label text-text-muted">rippl supporter</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-[46px] text-text-primary leading-none">$15</span>
            <span className="font-body text-[13px] text-text-muted">/ month</span>
          </div>
          <p className="font-body text-[13px] text-text-secondary mt-2 leading-relaxed">
            support ecosystem restoration and unlock advanced personal impact analytics.
          </p>
        </div>

        <div className="space-y-3 mb-7">
          {premiumFeatures.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-oasis-500/15 text-oasis-400 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={2.5} />
              </div>
              <span className="font-body text-[13px] text-text-primary">{label}</span>
            </div>
          ))}
        </div>

        <button className="gallery-primary w-full py-3.5 flex items-center justify-center gap-2 transition-all">
          <span className="font-body text-[13px] font-medium">upgrade to supporter</span>
          <ArrowRight size={15} />
        </button>
        <p className="font-body text-[11px] text-text-muted text-center mt-3">
          secure checkout · cancel anytime with one click
        </p>
      </div>

      <div className="gallery-card rounded-[26px] p-6 border border-border mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="gallery-label text-text-muted">standard</span>
            <h3 className="font-display text-[18px] text-text-primary mt-1">free tier</h3>
            <p className="font-body text-[12px] text-text-muted">for individuals building everyday green habits</p>
          </div>
          <div className="text-right">
            <span className="font-display text-[26px] text-text-primary">$0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          {freeFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-surface-overlay flex items-center justify-center shrink-0 text-text-muted">
                <Check size={10} />
              </div>
              <span className="font-body text-[12px] text-text-secondary">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-overlay/60 border border-border">
          <Leaf size={14} className="text-oasis-400 shrink-0" />
          <p className="font-body text-[11px] text-text-muted">
            verified sponsor partnerships help keep core logging free for all users.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="gallery-card p-5 rounded-[24px] border border-border">
          <div className="w-8 h-8 rounded-2xl bg-surface-overlay flex items-center justify-center mb-3 text-gulf-400">
            <Star size={16} />
          </div>
          <h4 className="font-display text-[15px] text-text-primary mb-1">community impact</h4>
          <p className="font-body text-[12px] text-text-muted leading-relaxed">
            10% of all subscription revenue directly funds verified local wetland and tree planting initiatives.
          </p>
        </div>

        <div className="gallery-card p-5 rounded-[24px] border border-border">
          <div className="w-8 h-8 rounded-2xl bg-surface-overlay flex items-center justify-center mb-3 text-dune-400">
            <Zap size={16} />
          </div>
          <h4 className="font-display text-[15px] text-text-primary mb-1">automatic offsets</h4>
          <p className="font-body text-[12px] text-text-muted leading-relaxed">
            every active supporter subscription automatically retires 20 kg of certified carbon removal monthly.
          </p>
        </div>
      </div>

      <div className="gallery-card p-5 rounded-[24px] border border-border flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-surface-overlay flex items-center justify-center shrink-0 text-text-primary">
          <Shield size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-display text-[15px] text-text-primary mb-1">looking for enterprise scope 3 tracking?</h4>
          <p className="font-body text-[12px] text-text-muted leading-relaxed">
            get company-wide team challenges, verified emissions analytics, and boardroom-ready reporting.
          </p>
          <button
            onClick={() => setActiveTab('corporate')}
            className="mt-3 inline-flex items-center gap-1.5 font-body text-[12px] text-oasis-400 hover:text-oasis-300 transition-colors"
          >
            <span>view corporate plans</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
