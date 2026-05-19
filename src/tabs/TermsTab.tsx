import { motion } from 'framer-motion'
import { FileText, Users, Award, Camera, CreditCard, Ban, Scale, Mail } from 'lucide-react'

function TermsSection({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
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

export function TermsTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-20"
    >
      <div className="mb-6 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">TERMS OF SERVICE</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">please read carefully before using rippl</p>
      </div>

      <div className="space-y-4">
        <TermsSection icon={<FileText size={16} />} title="Agreement to Terms" color="text-oasis-400">
          <p>
            By creating an account or using Rippl in any capacity, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not access or use the platform.
          </p>
          <p>
            These terms constitute a legally binding agreement between you and Rippl Technologies LLC ("Rippl," "we," "us"). We reserve the right to update these terms at any time with at least 14 days' notice delivered via in-app notification or email.
          </p>
        </TermsSection>

        <TermsSection icon={<Users size={16} />} title="Eligibility and Account" color="text-gulf-400">
          <p>
            Rippl is available to users aged 13 and older. Users under 18 require parental or guardian consent. By registering, you confirm that the information you provide is accurate and that you are authorized to use the Google account linked at sign-in.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account and for all activities that occur under it. You must notify us immediately at support@rippl.eco if you suspect any unauthorized access. One person may not operate multiple accounts to gain an unfair advantage on leaderboards or in the rewards system.
          </p>
        </TermsSection>

        <TermsSection icon={<Camera size={16} />} title="Action Logging and Verification" color="text-oasis-400">
          <p>
            Rippl allows you to log sustainable actions and submit photo proof for AI-assisted verification. You agree that all submissions are genuine, accurate, and represent actions you personally performed. Submitting fabricated, edited, or recycled photos constitutes fraud and will result in immediate account suspension.
          </p>
          <p>
            Our AI verification system provides a confidence score and may approve or reject submissions based on image content. Rippl reserves the right to manually review any submission and reverse awarded points if the action is found to be invalid. Decisions made by our moderation team are final.
          </p>
          <p>
            By submitting a photo, you grant Rippl a non-exclusive, royalty-free, worldwide license to use that image in anonymized form for platform improvement, training AI models, and promotional purposes, unless you explicitly request otherwise in writing.
          </p>
        </TermsSection>

        <TermsSection icon={<Award size={16} />} title="Points and Rewards" color="text-dune-400">
          <p>
            Points are a virtual currency with no monetary value outside of the Rippl rewards catalog. Points are non-transferable between accounts, cannot be exchanged for cash, and expire if your account remains inactive for 12 consecutive months.
          </p>
          <p>
            Rewards are subject to availability and may be modified or discontinued at any time. Once a reward is redeemed, the transaction is final and points cannot be refunded. Physical rewards are shipped to UAE addresses only unless otherwise stated. Delivery timelines are estimates and Rippl is not liable for third-party shipping delays.
          </p>
          <p>
            Rippl reserves the right to adjust point values, reward costs, and level thresholds at any time to maintain the integrity and sustainability of the rewards program.
          </p>
        </TermsSection>

        <TermsSection icon={<CreditCard size={16} />} title="Rippl Premium Subscription" color="text-gulf-400">
          <p>
            Rippl Premium is a monthly subscription billed at 15 AED per month. Payment is processed securely through Stripe. Your subscription renews automatically unless cancelled at least 24 hours before the end of the current billing period.
          </p>
          <p>
            Premium benefits including ad-free experience, exclusive rewards access, and unlimited AI verifications are active only while your subscription is current. Cancellation takes effect at the end of your paid period and no partial refunds are issued. If payment fails, access to Premium features is suspended until the outstanding balance is resolved.
          </p>
        </TermsSection>

        <TermsSection icon={<Ban size={16} />} title="Prohibited Conduct" color="text-red-400">
          <p>You agree not to:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Submit false or manipulated proof of sustainability actions</li>
            <li>Use bots, scripts, or automated tools to earn points</li>
            <li>Attempt to reverse-engineer or exploit the AI verification system</li>
            <li>Create multiple accounts to circumvent bans or limits</li>
            <li>Post offensive, discriminatory, or harmful content in community features</li>
            <li>Attempt to access other users' accounts or data</li>
            <li>Use Rippl for any purpose that violates UAE law or applicable international regulations</li>
          </ul>
          <p>
            Violations may result in point deductions, account suspension, or permanent termination without prior notice and without refund of any subscription fees paid.
          </p>
        </TermsSection>

        <TermsSection icon={<Scale size={16} />} title="Liability and Disclaimers" color="text-text-muted">
          <p>
            Rippl is provided on an "as is" and "as available" basis. We do not warrant that the platform will be uninterrupted, error-free, or that environmental impact metrics are certified to any official standard. CO2 and water savings are estimates based on recognized sustainability benchmarks and are provided for informational purposes only.
          </p>
          <p>
            To the maximum extent permitted by applicable law, Rippl shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount you paid to Rippl in the 90 days preceding the claim.
          </p>
          <p>
            Carbon offset rewards are facilitated through third-party providers. Rippl does not guarantee certification status or the permanence of offset projects.
          </p>
        </TermsSection>

        <TermsSection icon={<Mail size={16} />} title="Governing Law and Contact" color="text-oasis-500">
          <p>
            These Terms of Service are governed by the laws of the United Arab Emirates. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
          </p>
          <p>
            For questions about these terms, contact us at legal@rippl.eco. For general support, reach us at support@rippl.eco. For enterprise or partnership inquiries, contact enterprise@rippl.eco.
          </p>
        </TermsSection>

        <div className="flex items-center gap-2 justify-center py-4">
          <FileText size={14} className="text-text-muted" />
          <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Effective: May 2026 | Version 2.1</span>
        </div>
      </div>
    </motion.div>
  )
}
