import { motion } from 'framer-motion'
import { Check, Star, Zap, Crown, ArrowRight, Shield, Leaf } from 'lucide-react'
import { useApp } from '../App'

export function PricingTab() {
  const {  } = useApp()

  const freeFeatures = [
    'Unlimited action logging',
    'AI photo verification',
    'Community leaderboard',
    'Basic rewards access',
    'Personal impact dashboard',
    'Community feed',
  ]

  const premiumFeatures = [
    'Advanced ESG Data Insights',
    'Exclusive Premium Rewards',
    'Custom Profile Badges',
    'Unlimited AI Verifications',
    'Early Access to New Features',
    'Ad-Free Experience',
    'Priority support',
    'Downloadable impact reports',
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-20"
    >
      <div className="mb-6 pt-1 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-oasis-400/10 rounded-full mb-3">
          <Zap size={12} className="text-oasis-400" />
          <span className="font-mono text-[10px] text-oasis-400 font-bold tracking-widest uppercase">Pricing</span>
        </div>
        <h2 className="font-display text-[28px] text-text-primary leading-tight">Choose Your Plan</h2>
        <p className="font-mono text-[11px] text-text-muted mt-2">Simple, transparent pricing. No hidden fees.</p>
      </div>

      <div className="bg-surface-raised/40 border border-border rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-body text-[15px] font-bold text-text-primary">Free</p>
            <p className="font-mono text-[10px] text-text-muted">For individuals getting started</p>
          </div>
          <div className="text-right">
            <span className="font-display text-[26px] text-text-primary">0</span>
            <span className="font-display text-[14px] text-text-muted"> AED</span>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {freeFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-surface-overlay flex items-center justify-center shrink-0">
                <Check size={12} className="text-text-muted" />
              </div>
              <span className="font-body text-[13px] text-text-secondary">{feature}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 bg-surface-overlay/60 rounded-xl">
          <Leaf size={14} className="text-oasis-400 shrink-0" />
          <p className="font-mono text-[10px] text-text-muted">Ads help fund our mangrove planting program.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-surface-raised to-surface border-2 border-oasis-400/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 p-4">
          <Crown size={24} className="text-oasis-400/20" />
        </div>

        <div className="flex items-center gap-2 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-oasis-400/15 rounded-full">
            <Star size={10} className="text-oasis-400 fill-oasis-400" />
            <span className="font-mono text-[9px] text-oasis-400 font-bold uppercase tracking-wider">Most Popular</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-body text-[15px] font-bold text-text-primary mb-1">Rippl Premium</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[42px] text-text-primary">15</span>
            <span className="font-display text-[20px] text-text-primary">AED</span>
            <span className="font-body text-[14px] text-text-muted">/ month</span>
          </div>
          <p className="font-body text-[13px] text-text-secondary mt-2 italic">Support the planet and unlock your full impact potential.</p>
        </div>

        <div className="space-y-3.5 mb-8">
          {premiumFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-oasis-400/20 flex items-center justify-center shrink-0">
                <Check size={12} className="text-oasis-400" />
              </div>
              <span className="font-body text-[13px] text-text-primary">{feature}</span>
            </div>
          ))}
        </div>

        <button className="w-full bg-oasis-500 hover:bg-oasis-600 text-surface font-display text-[15px] py-4 rounded-2xl transition-all shadow-lg shadow-oasis-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
          Upgrade to Premium
          <ArrowRight size={16} />
        </button>

        <p className="font-mono text-[9px] text-text-muted text-center mt-4">Secure checkout powered by Stripe. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-raised/40 border border-border rounded-2xl p-4">
          <Star size={16} className="text-gulf-400 mb-2" />
          <h4 className="font-body text-[12px] font-bold text-text-primary">Community Support</h4>
          <p className="font-body text-[10px] text-text-muted mt-1">10% of revenue goes directly to local reforestation projects in the UAE.</p>
        </div>
        <div className="bg-surface-raised/40 border border-border rounded-2xl p-4">
          <Zap size={16} className="text-dune-400 mb-2" />
          <h4 className="font-body text-[12px] font-bold text-text-primary">Direct Impact</h4>
          <p className="font-body text-[10px] text-text-muted mt-1">Offset an additional 20kg of CO2 per month automatically with your subscription.</p>
        </div>
      </div>

      <div className="bg-surface-raised/40 border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-text-muted" />
          <p className="font-body text-[12px] font-bold text-text-primary">Enterprise Plans Available</p>
        </div>
        <p className="font-body text-[11px] text-text-secondary leading-relaxed">
          Organizations looking for team-wide ESG tracking, consolidated reporting, and Scope 3 analytics can explore Rippl for Enterprise. Pricing is per seat with volume discounts and a 30-day pilot for qualifying teams.
        </p>
      </div>
    </motion.div>
  )
}
