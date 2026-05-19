import { motion } from 'framer-motion'
import { Handshake, Store, Tag, Sparkles, Megaphone, ArrowRight, ClipboardList, Zap, BarChart2, CheckCircle2 } from 'lucide-react'

export function PartnershipsTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-20"
    >
      <div className="mb-6 pt-1 text-right">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary uppercase">Partnerships</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">grow with the green economy</p>
      </div>

      <div className="relative mb-8 rounded-3xl overflow-hidden bg-surface-raised border border-border">
        <div className="absolute inset-0 bg-gradient-to-l from-oasis-400/10 to-transparent pointer-events-none" />
        <div className="p-6">
          <Handshake size={32} className="text-oasis-400 mb-4" />
          <h3 className="font-display text-[20px] text-text-primary leading-tight">Brand Ecosystem</h3>
          <p className="font-body text-[13px] text-text-secondary mt-2">
            Connect your sustainable brand with a highly engaged audience actively making eco-conscious decisions in the UAE. Rippl partners reach users at the exact moment they are logging sustainable actions, making it the most contextually relevant channel in the green economy.
          </p>
        </div>
      </div>

      <h3 className="font-body text-[12px] font-bold text-text-muted uppercase tracking-widest mb-3">Partnership Types</h3>
      <div className="grid grid-cols-1 gap-4 mb-8">
        <PartnerType
          icon={<Store size={20} />}
          title="Reward Partner"
          desc="List your sustainable products or services directly in the Rippl rewards marketplace. Users redeem points earned from verified eco-actions against your offerings, driving high-intent traffic and purchases from an audience that has already demonstrated environmental values."
        />
        <PartnerType
          icon={<Tag size={20} />}
          title="Verified Vendor"
          desc="Get featured in the Local Produce and Eco-Shopping categories within the Rippl app. Verified Vendor status signals to users that your brand has passed Rippl's sustainability criteria, boosting trust and conversion for participating businesses."
        />
        <PartnerType
          icon={<Megaphone size={20} />}
          title="Impact Campaigns"
          desc="Sponsor community challenges and environmental initiatives co-branded with your organization. Impact Campaigns place your brand at the center of collective action events such as beach cleanups, tree planting drives, and zero-waste weeks across the UAE."
        />
        <PartnerType
          icon={<Sparkles size={20} />}
          title="White Label"
          desc="Integrate Rippl's AI verification engine, points infrastructure, and leaderboard system into your own loyalty or rewards app under your own brand. Ideal for supermarkets, airlines, and government bodies building green citizen programs."
        />
      </div>

      <h3 className="font-body text-[12px] font-bold text-text-muted uppercase tracking-widest mb-3">How to Become a Partner</h3>
      <div className="space-y-3 mb-8">
        <ProcessStep
          step="01"
          icon={<ClipboardList size={16} />}
          title="Submit Your Application"
          desc="Fill out the partner intake form with your brand details, sustainability credentials, and the type of partnership you are seeking. Our partnerships team reviews all applications within 3 business days and responds with a tailored proposal."
        />
        <ProcessStep
          step="02"
          icon={<CheckCircle2 size={16} />}
          title="Sustainability Verification"
          desc="Rippl conducts a lightweight sustainability review of your products, supply chain claims, and certifications. This protects the integrity of our marketplace and ensures users can trust every brand they encounter inside the app."
        />
        <ProcessStep
          step="03"
          icon={<Zap size={16} />}
          title="Integration and Launch"
          desc="Our team configures your reward listing, campaign creative, or API access. Standard Reward Partner integrations go live within 7 business days. White Label API deployments follow a structured onboarding timeline scoped to your technical requirements."
        />
        <ProcessStep
          step="04"
          icon={<BarChart2 size={16} />}
          title="Track Performance"
          desc="Access your partner dashboard to monitor redemption rates, campaign reach, user engagement, and sustainability impact attributed to your brand. Monthly performance reports are delivered automatically with actionable recommendations from your account manager."
        />
      </div>

      <div className="mt-8 p-6 bg-oasis-400/5 border border-oasis-400/20 rounded-3xl text-center">
        <h4 className="font-body text-[14px] font-bold text-text-primary mb-2">Ready to Rippl?</h4>
        <p className="font-body text-[12px] text-text-secondary mb-6">
          Join over 50 sustainable brands already active in the UAE ecosystem.
        </p>
        <button className="inline-flex items-center gap-2 bg-text-primary text-surface px-6 py-3 rounded-2xl font-body text-[13px] font-medium transition-transform active:scale-95">
          Become a Partner
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function ProcessStep({ step, icon, title, desc }: { step: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 bg-surface-raised/40 border border-border rounded-2xl">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-xl bg-oasis-400/10 flex items-center justify-center text-oasis-400">
          {icon}
        </div>
        <p className="font-mono text-[9px] text-oasis-400/60 text-center mt-1">{step}</p>
      </div>
      <div>
        <h4 className="font-body text-[13px] font-bold text-text-primary">{title}</h4>
        <p className="font-body text-[11px] text-text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function PartnerType({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-5 bg-surface-raised/40 border border-border rounded-2xl hover:border-oasis-400/40 transition-all cursor-pointer">
      <div className="flex items-center gap-4 mb-2">
        <div className="text-oasis-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="font-body text-[14px] font-bold text-text-primary">{title}</h4>
      </div>
      <p className="font-body text-[12px] text-text-secondary leading-relaxed">{desc}</p>
    </div>
  )
}
