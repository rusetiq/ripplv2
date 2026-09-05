import { motion } from 'framer-motion'
import { Handshake, Store, Tag, Sparkles, Megaphone, ArrowRight, ClipboardList, Zap, BarChart2, CheckCircle2 } from 'lucide-react'

export function PartnershipsTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-12 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">ecosystem</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">brand partnerships</h2>
        <p className="mt-1 text-[13px] text-text-muted">connect your sustainable offerings with people actively taking climate action.</p>
      </div>

      <div className="gallery-card rounded-[28px] border border-border overflow-hidden p-6 md:p-8 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-surface-overlay flex items-center justify-center text-oasis-400 mb-4">
          <Handshake size={24} strokeWidth={1.8} />
        </div>
        <h3 className="font-display text-[22px] text-text-primary leading-tight">build with the green economy</h3>
        <p className="font-body text-[13px] text-text-secondary mt-2 leading-relaxed">
          reach conscientious consumers at the exact moment they complete verified environmental actions. rippl partners enjoy authentic high-intent engagement without greenwashing.
        </p>
      </div>

      <p className="gallery-label text-text-muted mb-3">partnership models</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
        <PartnerType
          icon={<Store size={20} />}
          title="reward partner"
          desc="list sustainable products or discount vouchers directly in our rewards catalog. users redeem earned points for your perks."
        />
        <PartnerType
          icon={<Tag size={20} />}
          title="verified vendor"
          desc="receive featured placement in local produce and zero-waste shopping recommendations after meeting our criteria."
        />
        <PartnerType
          icon={<Megaphone size={20} />}
          title="sponsored campaigns"
          desc="sponsor collective community challenges (e.g. car-free weeks, tree planting) with prominent co-branding."
        />
        <PartnerType
          icon={<Sparkles size={20} />}
          title="white label api"
          desc="embed rippl's photo verification engine and points gamification directly into your consumer app or municipal portal."
        />
      </div>

      <p className="gallery-label text-text-muted mb-3">how onboarding works</p>
      <div className="space-y-3 mb-7">
        <ProcessStep
          step="01"
          icon={<ClipboardList size={16} />}
          title="submit brand credentials"
          desc="share details regarding your sustainability certifications, supply chain ethics, and proposed user incentives."
        />
        <ProcessStep
          step="02"
          icon={<CheckCircle2 size={16} />}
          title="rapid verification"
          desc="our standards committee reviews submissions in 3 business days to protect marketplace integrity."
        />
        <ProcessStep
          step="03"
          icon={<Zap size={16} />}
          title="launch in marketplace"
          desc="listings and sponsored campaigns go live with instant tracking on partner dashboard analytics."
        />
        <ProcessStep
          step="04"
          icon={<BarChart2 size={16} />}
          title="measure converted impact"
          desc="track verified redemptions, brand sentiment, and tangible carbon offset metrics."
        />
      </div>

      <div className="gallery-card p-8 rounded-[28px] border border-border text-center">
        <h4 className="font-display text-[20px] text-text-primary mb-2">ready to partner with rippl?</h4>
        <p className="font-body text-[13px] text-text-muted mb-6 max-w-sm mx-auto">
          join leading green brands driving genuine, verifiable consumer climate habits.
        </p>
        <button className="gallery-primary inline-flex items-center gap-2 px-6 py-3.5 transition-all">
          <span className="font-body text-[13px] font-medium">apply for brand partnership</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function ProcessStep({ step, icon, title, desc }: { step: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 gallery-card border border-border rounded-[22px]">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-surface-overlay flex items-center justify-center text-oasis-400">
          {icon}
        </div>
        <span className="font-mono text-[10px] text-text-muted mt-1">{step}</span>
      </div>
      <div>
        <h4 className="font-display text-[14px] text-text-primary">{title}</h4>
        <p className="font-body text-[12px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function PartnerType({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-5 gallery-card border border-border rounded-[24px] hover:border-border-active transition-all">
      <div className="w-10 h-10 rounded-2xl bg-surface-overlay flex items-center justify-center text-oasis-400 mb-3">
        {icon}
      </div>
      <h4 className="font-display text-[15px] text-text-primary mb-1">{title}</h4>
      <p className="font-body text-[12px] text-text-secondary leading-relaxed">{desc}</p>
    </div>
  )
}
