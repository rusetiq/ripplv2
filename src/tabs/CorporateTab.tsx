import { motion } from 'framer-motion'
import { LayoutDashboard, BarChart, Users, Globe, Building2, ArrowUpRight, ClipboardList, Zap, FileCheck } from 'lucide-react'

export function CorporateTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-12 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">enterprise</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">corporate esg</h2>
        <p className="mt-1 text-[13px] text-text-muted">enterprise-grade sustainability tracking and scope 3 accounting.</p>
      </div>

      <div className="expressive-card sapphire-card rounded-[30px] overflow-hidden mb-6 text-white shadow-xl">
        <div className="p-6 md:p-8">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 border border-white/20">
            <Building2 size={24} strokeWidth={1.8} />
          </div>
          <h3 className="font-display text-[24px] text-white font-semibold leading-tight">empower your workforce</h3>
          <p className="font-body text-[13px] text-white/90 mt-2.5 leading-relaxed">
            rippl for enterprise transforms everyday employee habits into verified, audit-ready ESG data points aligned with GHG Protocol, GRI, and TCFD standards.
          </p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 border-t border-white/15 bg-black/15 backdrop-blur-xs">
          <div>
            <p className="gallery-label text-white/70">collective reduction</p>
            <p className="font-display text-[22px] font-bold text-white mt-1">12.4 tons</p>
            <p className="font-body text-[11px] text-emerald-300 mt-0.5">up 14% this quarter</p>
          </div>
          <div>
            <p className="gallery-label text-white/70">team participation</p>
            <p className="font-display text-[22px] font-bold text-white mt-1">84%</p>
            <p className="font-body text-[11px] text-emerald-300 mt-0.5">verified active staff</p>
          </div>
        </div>
      </div>

      <p className="gallery-label text-text-muted mb-3">how it works</p>
      <div className="space-y-3 mb-6">
        <ProcessStep
          step="01"
          icon={<ClipboardList size={16} />}
          title="onboard your team"
          desc="dedicated workspace provisioned in 48 hours. employees join via secure single sign-on link and connect their rippl accounts."
        />
        <ProcessStep
          step="02"
          icon={<Zap size={16} />}
          title="log and verify actions"
          desc="employees log green commutes, low-waste habits, and energy-saving measures with automatic AI photo verification."
        />
        <ProcessStep
          step="03"
          icon={<BarChart size={16} />}
          title="track live esg metrics"
          desc="real-time scope 3 emissions broken down by department, facility, and habit category with exportable audit logs."
        />
        <ProcessStep
          step="04"
          icon={<FileCheck size={16} />}
          title="report and disclose"
          desc="one-click automated ESG reports mapped directly to UN Sustainable Development Goals for board and regulatory presentations."
        />
      </div>

      <p className="gallery-label text-text-muted mb-3">platform capabilities</p>
      <div className="space-y-3 mb-6">
        <DashboardFeature
          icon={<LayoutDashboard size={18} />}
          title="consolidated compliance reporting"
          desc="automated disclosures ready for stakeholders and external audits based on genuine employee actions."
        />
        <DashboardFeature
          icon={<BarChart size={18} />}
          title="scope 3 habit analytics"
          desc="measure emissions from commutes and daily choices that traditional accounting tools frequently overlook."
        />
        <DashboardFeature
          icon={<Users size={18} />}
          title="department challenges"
          desc="friendly sustainability challenges between departments that sustainably boost retention and workplace engagement."
        />
        <DashboardFeature
          icon={<Globe size={18} />}
          title="un sdg alignment"
          desc="every action is mapped to global targets for clear, verifiable corporate storytelling."
        />
      </div>

      <div className="gallery-card rounded-[24px] p-5 border border-border mb-6">
        <p className="font-display text-[14px] text-text-primary mb-1">enterprise pilot</p>
        <p className="font-body text-[12px] text-text-secondary leading-relaxed">
          flexible seat pricing including dedicated account management, custom branding, and API integrations. 30-day pilot available for teams of 25+.
        </p>
      </div>

      <button className="gallery-primary w-full py-3.5 flex items-center justify-center gap-2 transition-all">
        <span className="font-body text-[13px] font-medium">request enterprise consultation</span>
        <ArrowUpRight size={15} />
      </button>
    </motion.div>
  )
}

function ProcessStep({ step, icon, title, desc }: { step: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 gallery-card border border-border rounded-[22px]">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-surface-overlay flex items-center justify-center text-gulf-400">
          {icon}
        </div>
        <span className="font-mono text-[10px] text-text-muted mt-1">{step}</span>
      </div>
      <div>
        <h4 className="font-display text-[14px] text-text-primary">{title}</h4>
        <p className="font-body text-[12px] text-text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function DashboardFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 gallery-card border border-border rounded-[22px]">
      <div className="w-10 h-10 rounded-2xl bg-surface-overlay flex items-center justify-center shrink-0 text-oasis-400">
        {icon}
      </div>
      <div>
        <h4 className="font-display text-[14px] text-text-primary">{title}</h4>
        <p className="font-body text-[12px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
