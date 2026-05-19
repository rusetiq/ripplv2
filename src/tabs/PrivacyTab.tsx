import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, Megaphone, Database, UserCheck, Globe } from 'lucide-react'

function PolicySection({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
  return (
    <section className="bg-surface-raised/40 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={color}>{icon}</span>
        <h3 className="font-body text-[14px] font-bold text-text-primary">{title}</h3>
      </div>
      <div className="font-body text-[12px] text-text-secondary leading-relaxed space-y-2">
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
      className="px-4 pb-20"
    >
      <div className="mb-6 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">PRIVACY POLICY</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">your data, your control</p>
      </div>

      <div className="space-y-4">
        <PolicySection icon={<Shield size={16} />} title="Data Protection" color="text-oasis-400">
          <p>
            Rippl is committed to protecting your personal data in full compliance with applicable UAE and international privacy regulations. We collect the minimum information required to operate the platform, including your name, email address, profile photo, and activity logs tied to your sustainability actions.
          </p>
          <p>
            All data is encrypted in transit using TLS and stored on secure, access-controlled servers. We conduct regular security audits and apply industry best practices to prevent unauthorized access, disclosure, or loss of your information.
          </p>
        </PolicySection>

        <PolicySection icon={<Database size={16} />} title="What We Collect" color="text-gulf-400">
          <p>We collect the following categories of data when you use Rippl:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Account identifiers: name, email, and profile photo from Google Sign-In</li>
            <li>Activity data: action logs, photo submissions, and verification results</li>
            <li>Environmental metrics: CO2 saved, water conserved, and streak data</li>
            <li>Reward history: points balance and redeemed rewards</li>
            <li>Device and usage data: app version, session timestamps, and interaction patterns</li>
            <li>Location context: city-level region used to power UAE leaderboards</li>
          </ul>
        </PolicySection>

        <PolicySection icon={<Lock size={16} />} title="Information Usage" color="text-gulf-400">
          <p>
            Your data is used to provide and continuously improve the Rippl experience. Specific uses include calculating your real-world environmental impact, managing your points and rewards, generating your personal ESG report, powering community leaderboards, and detecting fraudulent or invalid action submissions.
          </p>
          <p>
            We never sell your personal data to third parties. We share data only with trusted service providers who process it on our behalf under strict contractual obligations, including Firebase for database and authentication, and Google Gemini for AI-based action verification.
          </p>
        </PolicySection>

        <PolicySection icon={<Megaphone size={16} />} title="Advertising and Data Use" color="text-dune-400">
          <p>
            Rippl uses your data to deliver relevant advertising and sponsored content within the app. This includes presenting offers, promotions, and sustainability-related brand campaigns from our verified partner network. Advertising helps us keep the core Rippl experience free and fund environmental initiatives such as our mangrove planting program.
          </p>
          <p>
            We use aggregated behavioral data, such as action categories, points tier, and engagement level, to match you with advertisements that align with your sustainability interests. We do not share individually identifiable personal data with advertisers.
          </p>
          <p>
            Rippl Premium subscribers receive an ad-free experience. Free-tier users may see sponsored reward offers and branded sustainability challenges clearly labeled as advertisements. You may contact us at privacy@rippl.eco to request information about the advertising categories applied to your account.
          </p>
        </PolicySection>

        <PolicySection icon={<Globe size={16} />} title="Cookies and Tracking" color="text-oasis-500">
          <p>
            We use functional cookies and local storage to maintain your session, remember your preferences, and analyze aggregate platform performance. We do not use cross-site tracking cookies or share tracking data with third-party advertising networks outside of our disclosed partner program.
          </p>
          <p>
            Analytics are processed in an aggregated, anonymized form to help us understand how users interact with different features. This data is never used to create individual behavioral profiles sold to external parties.
          </p>
        </PolicySection>

        <PolicySection icon={<UserCheck size={16} />} title="Your Rights" color="text-oasis-400">
          <p>
            You have the right to access, correct, export, or permanently delete your personal data at any time. These actions are available through your profile settings. Deletion of your account removes all personal identifiers from our active databases within 30 days, though anonymized aggregate data may be retained for research purposes.
          </p>
          <p>
            You may also withdraw consent for advertising personalization at any time by upgrading to Rippl Premium or contacting us directly. For any privacy-related inquiries, reach us at privacy@rippl.eco.
          </p>
        </PolicySection>

        <PolicySection icon={<Eye size={16} />} title="Transparency and Updates" color="text-dune-400">
          <p>
            We will notify you of material changes to this Privacy Policy via in-app notification or email at least 14 days before they take effect. Continued use of Rippl after that date constitutes acceptance of the updated terms.
          </p>
          <p>
            This policy applies to all users of the Rippl mobile and web application. For corporate or enterprise data processing agreements, please contact enterprise@rippl.eco.
          </p>
        </PolicySection>

        <div className="flex items-center gap-2 justify-center py-4">
          <FileText size={14} className="text-text-muted" />
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Last Updated: May 2026</span>
        </div>
      </div>
    </motion.div>
  )
}
