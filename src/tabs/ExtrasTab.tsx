import { motion } from 'framer-motion'
import { Shield, CreditCard, Building2, Handshake, ChevronRight, Globe, Heart, ScrollText } from 'lucide-react'
import { useApp } from '../App'

export function ExtrasTab() {
  const { setActiveTab } = useApp()

  const links = [
    {
      id: 'impact',
      label: 'Your Impact',
      desc: 'Badges & metrics dashboard',
      icon: <Globe size={20} className="text-oasis-400" />,
      color: 'bg-oasis-400/10'
    },
    {
      id: 'pricing',
      label: 'Rippl Premium',
      desc: 'Exclusive rewards & impact tracking',
      icon: <CreditCard size={20} className="text-oasis-400" />,
      color: 'bg-oasis-400/10'
    },
    {
      id: 'corporate',
      label: 'Corporate ESG',
      desc: 'enterprise-grade sustainability',
      icon: <Building2 size={20} className="text-gulf-400" />,
      color: 'bg-gulf-400/10'
    },
    {
      id: 'partnerships',
      label: 'Brand Partnerships',
      desc: 'Join the green ecosystem',
      icon: <Handshake size={20} className="text-dune-400" />,
      color: 'bg-dune-400/10'
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      desc: 'How we handle your data',
      icon: <Shield size={20} className="text-oasis-500" />,
      color: 'bg-oasis-500/10'
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      desc: 'Rules that govern your use of Rippl',
      icon: <ScrollText size={20} className="text-text-muted" />,
      color: 'bg-surface-overlay'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-24"
    >
      <div className="mb-6 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary uppercase">EXTRAS</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">Explore the Rippl ecosystem</p>
      </div>

      <div className="space-y-3">
        {links.map((link, i) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveTab(link.id as any)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface-raised/40 hover:bg-surface-overlay/60 transition-all text-left group active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-body text-[14px] font-bold text-text-primary uppercase tracking-tight">{link.label}</h3>
              <p className="font-mono text-[10px] text-text-muted mt-0.5 truncate uppercase tracking-widest">{link.desc}</p>
            </div>
            <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-3xl bg-gradient-to-br from-oasis-400/10 via-transparent to-gulf-400/10 border border-border text-center">
        <div className="inline-flex p-3 rounded-full bg-surface-raised mb-4 border border-border">
          <Heart size={20} className="text-red-400 fill-red-400/20" />
        </div>
        <h3 className="font-display text-[18px] text-text-primary leading-tight">Support Local Habitats</h3>
        <p className="font-body text-[12px] text-text-secondary mt-2 mb-6 px-4">
          Every sustainable action logged contributes to our goal of planting 1M Mangroves across the UAE.
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-display text-[20px] text-oasis-400">12.4K</p>
            <p className="font-mono text-[8px] text-text-muted uppercase">Planted</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="font-display text-[20px] text-gulf-400">88.2K</p>
            <p className="font-mono text-[8px] text-text-muted uppercase">Community Logs</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
