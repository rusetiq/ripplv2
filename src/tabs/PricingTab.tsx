import { motion } from 'framer-motion'
import { Check, ArrowRight, Leaf, Star, Zap, Building2, Sparkles } from 'lucide-react'
import { useApp } from '../AppContext'
import { DotNumber } from '../components/DotNumber'

const freeFeatures = [
  'unlimited eco action logging',
  'ai photo proof verification',
  'community leaderboard access',
  'community rewards redemption',
  'personal impact dashboard',
  'public community social feed',
]

const supporterFeatures = [
  'advanced esg data insights',
  'exclusive premium partner vouchers',
  'custom profile verification badges',
  'unlimited priority ai verifications',
  'early access to new platform features',
  'completely ad-free experience',
  'monthly certified carbon offset credit',
  'downloadable audit certificates',
]

const enterpriseFeatures = [
  'full company-wide scope 3 tracking',
  'department challenges & leaderboards',
  'ghg protocol & tcfd audit reports',
  'single sign-on (sso) & hris integration',
  'dedicated sustainability account manager',
  'custom branded rewards catalog',
]

export function PricingTab() {
  const { setActiveTab } = useApp()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-2"
    >
      <div className="mb-6 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">membership & tiers</p>
        <h2 className="font-display text-[28px] leading-tight text-text-primary">choose your plan</h2>
        <p className="mt-1 text-[13px] text-text-muted">simple, transparent plans in UAE Dirhams (AED) to power genuine environmental action.</p>
      </div>

      <div className="space-y-5 mb-8">
        <div className="expressive-card aurora-card relative rounded-[36px] p-6 text-white shadow-xl md:p-8">
          <div className="mb-6">
            <p className="font-body text-[12px] text-white/80 uppercase tracking-tight">rippl supporter</p>
            <div className="flex items-baseline gap-2 mt-1">
              <DotNumber value="20" className="text-white fill-white h-11" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[18px] font-semibold text-white">AED</span>
                <span className="font-body text-[11px] text-white/80">/ month</span>
              </div>
            </div>
            <p className="font-body text-[13px] text-white/90 mt-2.5 leading-relaxed max-w-md">
              direct monthly carbon offsetting, verified partner perks, and certified personal ESG reporting.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] text-white">
              <Sparkles size={12} />
              <span>or 200 AED / year (save 2 months free)</span>
            </div>
          </div>

          <div className="space-y-3 mb-8 border-t border-white/20 pt-6">
            {supporterFeatures.map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                  <Check size={12} strokeWidth={2.8} />
                </div>
                <span className="font-body text-[13px] text-white font-medium">{label}</span>
              </div>
            ))}
          </div>

          <button className="gradient-card-action w-full py-4 rounded-full font-body text-[14px] font-semibold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>subscribe for 20 aed</span>
            <ArrowRight size={15} />
          </button>
          <p className="font-body text-[11px] text-white/80 text-center mt-3">
            secure payments via apple pay, card, or google pay · cancel anytime
          </p>
        </div>

        <div className="expressive-card silver-card p-6 md:p-8 rounded-[36px] shadow-lg text-white relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-[24px] text-white mt-0.5">free tier</h3>
              <p className="font-body text-[13px] text-white/80 mt-1">for individual citizens building daily green routines</p>
            </div>
            <div className="flex items-baseline gap-1">
              <DotNumber value="0" className="text-white fill-white h-8" />
              <span className="font-display text-[14px] text-white/80">AED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 border-t border-white/15 pt-5">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white border border-white/25">
                  <Check size={10} strokeWidth={2.5} />
                </div>
                <span className="font-body text-[12px] text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <Leaf size={15} className="text-oasis-300 shrink-0" />
            <p className="font-body text-[12px] text-white/85">
              free tier users receive community sponsor campaigns that fund local wetland restoration.
            </p>
          </div>
        </div>

        <div className="expressive-card sapphire-card p-6 md:p-8 rounded-[36px] shadow-xl text-white relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-[26px] text-white mt-0.5">corporate esg</h3>
              <p className="font-body text-[13px] text-white/85 mt-1">for companies measuring Scope 3 employee emissions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Building2 size={22} />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <DotNumber value="45" className="text-white fill-white h-8" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[15px] font-semibold text-white">AED</span>
                <span className="font-body text-[11px] text-white/80">/ seat / month</span>
              </div>
            </div>
            <p className="font-body text-[12px] text-white/85 mt-1">volume tiered pricing available for teams over 50 seats.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 border-t border-white/20 pt-5">
            {enterpriseFeatures.map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white border border-white/25">
                  <Check size={10} strokeWidth={2.5} />
                </div>
                <span className="font-body text-[12px] text-white/90">{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('corporate')}
            className="gradient-card-action w-full py-3.5 rounded-full font-body text-[13px] font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>explore corporate esg & request demo</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="expressive-card solar-card p-6 rounded-[30px] text-white shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white">
            <Star size={18} />
          </div>
          <h4 className="font-display text-[18px] text-white mb-1">uae community fund</h4>
          <p className="font-body text-[12px] text-white/90 leading-relaxed">
            10% of every AED paid goes directly to verified mangrove restoration projects in Abu Dhabi and Dubai.
          </p>
        </div>

        <div className="expressive-card forest-card p-6 rounded-[30px] text-white shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white">
            <Zap size={18} />
          </div>
          <h4 className="font-display text-[18px] text-white mb-1">automatic carbon credits</h4>
          <p className="font-body text-[12px] text-white/90 leading-relaxed">
            each supporter tier subscription automatically retires 20 kg of registered high-integrity carbon removal each month.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
