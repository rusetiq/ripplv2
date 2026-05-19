import { motion } from 'framer-motion'
import { LayoutDashboard, BarChart, Users, Globe, Building2, ArrowUpRight, CheckCircle2, ClipboardList, Zap, FileCheck } from 'lucide-react'

export function CorporateTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-20"
    >
      <div className="mb-6 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary uppercase">Corporate ESG</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">enterprise-grade sustainability tracking</p>
      </div>

      <div className="bg-surface-raised/40 rounded-3xl border border-border overflow-hidden mb-6">
        <div className="p-6 bg-gradient-to-br from-gulf-400/20 to-transparent">
          <Building2 size={32} className="text-gulf-400 mb-4" />
          <h3 className="font-display text-[20px] text-text-primary leading-tight">Empower Your Workforce</h3>
          <p className="font-body text-[13px] text-text-secondary mt-2">
            Rippl for Enterprise delivers real-time ESG metrics from verified employee actions. Every sustainable habit your team builds becomes a measurable, boardroom-ready data point aligned with global reporting frameworks.
          </p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 border-t border-border">
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-text-muted uppercase">Global Impact</p>
            <p className="font-display text-[18px] text-text-primary">12.4 Tons</p>
            <p className="font-mono text-[8px] text-oasis-400">Up 14% vs last month</p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-text-muted uppercase">Engagement</p>
            <p className="font-display text-[18px] text-text-primary">84%</p>
            <p className="font-mono text-[8px] text-oasis-400">Active employees</p>
          </div>
        </div>
      </div>

      <h3 className="font-body text-[12px] font-bold text-text-muted uppercase tracking-widest mb-3">How It Works</h3>
      <div className="space-y-3 mb-6">
        <ProcessStep
          step="01"
          icon={<ClipboardList size={16} />}
          title="Onboard Your Team"
          desc="We provision a dedicated corporate workspace in under 48 hours. Employees join via a secure invite link and connect their existing Rippl accounts. Your HR admin gains immediate dashboard access to configure departments, set sustainability goals, and launch company-wide challenges."
        />
        <ProcessStep
          step="02"
          icon={<Zap size={16} />}
          title="Log and Verify Actions"
          desc="Employees log metro commutes, low-waste meals, refill station visits, and energy-saving habits just as they do on the free tier. Our AI verification engine validates photo submissions in real time and tags each log with department metadata for automatic aggregation into your ESG data stream."
        />
        <ProcessStep
          step="03"
          icon={<BarChart size={16} />}
          title="Track Live ESG Metrics"
          desc="Your enterprise dashboard displays real-time Scope 3 emissions broken down by department, location, and action category. Metrics are mapped to the GHG Protocol and aligned with GRI and TCFD frameworks so your sustainability team can pull audit-ready data at any time."
        />
        <ProcessStep
          step="04"
          icon={<FileCheck size={16} />}
          title="Report and Present"
          desc="Generate automated ESG reports with a single click. Reports include CO2 reduction totals, participation rates, top actions by category, year-over-year trends, and UN SDG alignment scores. Export to PDF or structured data for board presentations, investor disclosures, and regulatory submissions."
        />
      </div>

      <h3 className="font-body text-[12px] font-bold text-text-muted uppercase tracking-widest mb-3">Platform Features</h3>
      <div className="space-y-3 mb-6">
        <DashboardFeature
          icon={<LayoutDashboard size={18} />}
          title="Consolidated Reporting"
          desc="Automated ESG reports ready for audit and board meetings. Every metric is tied to a verified employee action, giving your disclosures credibility that self-reported data cannot match."
        />
        <DashboardFeature
          icon={<BarChart size={18} />}
          title="Scope 3 Analytics"
          desc="Measure indirect emissions from employee commutes, food choices, and daily habits. Rippl captures data that traditional ESG tools miss, filling the most difficult gap in corporate carbon accounting."
        />
        <DashboardFeature
          icon={<Users size={18} />}
          title="Team Competitions"
          desc="Foster a culture of sustainability with internal department leaderboards and company-wide challenges. Gamification drives significantly higher participation than passive reporting tools."
        />
        <DashboardFeature
          icon={<Globe size={18} />}
          title="SDG Alignment"
          desc="Each logged action is automatically mapped to relevant UN Sustainable Development Goals, giving you a ready-made narrative for ESG disclosures and stakeholder communications."
        />
        <DashboardFeature
          icon={<CheckCircle2 size={18} />}
          title="Verified Data Integrity"
          desc="Every data point is backed by an AI-verified employee submission, transforming self-reported activity into defensible, audit-quality evidence that satisfies due diligence requirements."
        />
      </div>

      <div className="bg-gulf-400/5 border border-gulf-400/20 rounded-2xl p-4 mb-6">
        <p className="font-body text-[12px] font-bold text-text-primary mb-1">Enterprise Pricing</p>
        <p className="font-body text-[12px] text-text-secondary leading-relaxed">
          Plans are priced per seat and include dedicated onboarding, a named account manager, custom branding, and priority API access. A 30-day pilot is available for organizations with 25 or more employees.
        </p>
      </div>

      <button className="w-full bg-surface-raised border border-border hover:border-gulf-400/50 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
        <span className="font-body text-[13px] text-text-primary">Request Enterprise Demo</span>
        <ArrowUpRight size={14} className="text-text-muted" />
      </button>
    </motion.div>
  )
}

function ProcessStep({ step, icon, title, desc }: { step: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 bg-surface-raised/40 border border-border rounded-2xl">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gulf-400/10 flex items-center justify-center text-gulf-400">
          {icon}
        </div>
        <p className="font-mono text-[9px] text-gulf-400/60 text-center mt-1">{step}</p>
      </div>
      <div>
        <h4 className="font-body text-[13px] font-bold text-text-primary">{title}</h4>
        <p className="font-body text-[11px] text-text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function DashboardFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 bg-surface-raised/40 border border-border rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center shrink-0 text-gulf-400">
        {icon}
      </div>
      <div>
        <h4 className="font-body text-[13px] font-bold text-text-primary">{title}</h4>
        <p className="font-body text-[11px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
