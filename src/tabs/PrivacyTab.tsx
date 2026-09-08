import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, Megaphone, Database, UserCheck, Globe } from 'lucide-react'

function PolicySection({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
  return (
    <section className="gallery-card rounded-[24px] border border-border p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={color}>{icon}</span>
        <h3 className="font-display text-[15px] text-text-primary">{title.toLowerCase()}</h3>
      </div>
      <div className="font-body text-[13px] text-text-secondary leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  )
}

export function PrivacyTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-2"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">legal</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">privacy policy</h2>
        <p className="mt-1 text-[13px] text-text-muted">transparent, responsible handling of your environmental records.</p>
      </div>

      <div className="space-y-3.5">
        <PolicySection icon={<Shield size={16} />} title="Data Protection" color="text-oasis-400">
          <p>
            Rippl is committed to protecting your personal data in accordance with applicable global privacy standards. We collect only what is necessary to record and verify your environmental impact.
          </p>
          <p>
            All records are encrypted in transit via TLS and stored in access-controlled, audited cloud infrastructure. We do not sell personal data to data brokers.
          </p>
        </PolicySection>

        <PolicySection icon={<Database size={16} />} title="What We Collect" color="text-gulf-400">
          <p>The information we collect includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Basic account identity (name, email, and avatar from Google OAuth)</li>
            <li>Uploaded action photos and verification outcome logs</li>
            <li>Calculated impact metrics (kg of CO₂, litres of water saved, day streaks)</li>
            <li>Points balances and redeemed marketplace rewards</li>
            <li>General coarse regional location to highlight community milestones</li>
          </ul>
        </PolicySection>

        <PolicySection icon={<Lock size={16} />} title="Information Usage" color="text-gulf-400">
          <p>
            Your information is used strictly to power core app features: calculating emissions offsets, validating sustainability submissions with Gemini AI, managing rewards, and computing community rankings.
          </p>
          <p>
            Data is shared only with trusted infrastructure providers (Firebase and Google Gemini) bound by confidentiality and security agreements.
          </p>
        </PolicySection>

        <PolicySection icon={<Megaphone size={16} />} title="Advertising and Partner Offers" color="text-dune-400">
          <p>
            Rippl presents sponsored reward opportunities and environmental campaigns from verified sustainable businesses. This subsidizes tree planting initiatives and keeps the platform free for global citizens.
          </p>
          <p>
            No personal identity records are shared with advertisers. Rippl Supporter members enjoy a completely ad-free experience.
          </p>
        </PolicySection>

        <PolicySection icon={<Globe size={16} />} title="Cookies and Local Storage" color="text-oasis-500">
          <p>
            We use minimal functional browser storage to maintain session states and theme preferences. We do not use third-party tracking beacons or sell cross-site behavioral telemetry.
          </p>
        </PolicySection>

        <PolicySection icon={<UserCheck size={16} />} title="Your Privacy Rights" color="text-oasis-400">
          <p>
            You have the full right to export your complete action record or permanently delete your account at any time directly through your profile settings or by reaching privacy@rippl.eco.
          </p>
        </PolicySection>

        <PolicySection icon={<Eye size={16} />} title="Policy Updates" color="text-dune-400">
          <p>
            Notice of material revisions will be provided in-app at least 14 days prior to taking effect. Ongoing use of the application indicates acceptance of the terms.
          </p>
        </PolicySection>

        <div className="flex items-center gap-2 justify-center py-4">
          <FileText size={14} className="text-text-muted" />
          <span className="font-body text-[11px] text-text-muted">last updated: may 2026</span>
        </div>
      </div>
    </motion.div>
  )
}
