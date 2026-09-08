import { motion } from 'framer-motion'
import { FileText, Users, Award, Camera, CreditCard, Ban, Scale, Mail } from 'lucide-react'

function TermsSection({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
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

export function TermsTab() {
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
        <h2 className="font-display text-[26px] leading-tight text-text-primary">terms of service</h2>
        <p className="mt-1 text-[13px] text-text-muted">guidelines and community rules for participating in the rippl ecosystem.</p>
      </div>

      <div className="space-y-3.5">
        <TermsSection icon={<FileText size={16} />} title="Agreement to Terms" color="text-oasis-400">
          <p>
            By accessing or creating an account on Rippl, you agree to comply with these terms and our privacy guidelines. These terms govern the relationship between you and Rippl.
          </p>
          <p>
            We reserve the right to revise terms with a minimum 14 days notice via notification.
          </p>
        </TermsSection>

        <TermsSection icon={<Users size={16} />} title="Eligibility and Identity" color="text-gulf-400">
          <p>
            Rippl is open to members aged 13 and above. You agree to maintain accurate account details and are responsible for activity conducted through your authenticated Google profile.
          </p>
          <p>
            Operating automated dummy accounts to game leaderboards or siphon marketplace rewards is strictly prohibited.
          </p>
        </TermsSection>

        <TermsSection icon={<Camera size={16} />} title="Action Logging and Verification" color="text-oasis-400">
          <p>
            Action submissions must represent genuine sustainable actions performed directly by you. Submitting stock imagery or manipulated photographs constitutes fraudulent conduct.
          </p>
          <p>
            Our verification engine reviews submissions in real time. We reserve the right to audit logs and adjust point awards if submissions violate community authenticity rules.
          </p>
        </TermsSection>

        <TermsSection icon={<Award size={16} />} title="Points and Marketplace Perks" color="text-dune-400">
          <p>
            Points represent a virtual sustainability scoring metric. Points carry no independent cash currency value and may not be traded or sold outside the authorized rewards catalog.
          </p>
          <p>
            Rewards are subject to partner inventory and may be refreshed periodically.
          </p>
        </TermsSection>

        <TermsSection icon={<CreditCard size={16} />} title="Supporter Subscription" color="text-gulf-400">
          <p>
            Supporter subscriptions renew automatically monthly. Subscriptions may be cancelled at any time directly through profile settings without penalties.
          </p>
        </TermsSection>

        <TermsSection icon={<Ban size={16} />} title="Community Safety & Prohibited Conduct" color="text-red-400">
          <p>Users must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submit counterfeit or synthetic proof of eco actions</li>
            <li>Run scripts or scrapers against the leaderboard or community feed</li>
            <li>Post abusive or commercial spam in community posts or comment threads</li>
          </ul>
        </TermsSection>

        <TermsSection icon={<Scale size={16} />} title="Disclaimers" color="text-text-muted">
          <p>
            Impact measurements (such as kg CO₂ or litres of water saved) are computed based on peer-reviewed environmental life-cycle factors for informational encouragement.
          </p>
        </TermsSection>

        <TermsSection icon={<Mail size={16} />} title="Contact & Governance" color="text-oasis-500">
          <p>
            Inquiries regarding these terms may be directed to legal@rippl.eco or support@rippl.eco.
          </p>
        </TermsSection>

        <div className="flex items-center gap-2 justify-center py-4">
          <FileText size={14} className="text-text-muted" />
          <span className="font-body text-[11px] text-text-muted">version 2.1 · effective may 2026</span>
        </div>
      </div>
    </motion.div>
  )
}
