import { motion } from 'framer-motion'
import { Shield, CreditCard, Building2, Handshake, ChevronRight, Globe, Heart, ScrollText } from 'lucide-react'
import { useApp } from '../App'
import { DotNumber } from '../components/DotNumber'

export function ExtrasTab() {
  const { setActiveTab } = useApp()

  const links = [
    {
      id: 'impact',
      label: 'your impact',
      desc: 'badges, carbon savings & metrics',
      icon: <Globe size={20} className="text-oasis-400" />,
    },
    {
      id: 'pricing',
      label: 'rippl supporter',
      desc: 'exclusive rewards & direct offsetting',
      icon: <CreditCard size={20} className="text-oasis-400" />,
    },
    {
      id: 'corporate',
      label: 'corporate esg',
      desc: 'enterprise-grade sustainability tracking',
      icon: <Building2 size={20} className="text-gulf-400" />,
    },
    {
      id: 'partnerships',
      label: 'brand partnerships',
      desc: 'join the verified green ecosystem',
      icon: <Handshake size={20} className="text-dune-400" />,
    },
    {
      id: 'privacy',
      label: 'privacy policy',
      desc: 'transparent data handling & user control',
      icon: <Shield size={20} className="text-oasis-500" />,
    },
    {
      id: 'terms',
      label: 'terms of service',
      desc: 'community rules and guidelines',
      icon: <ScrollText size={20} className="text-text-muted" />,
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-12 md:px-0"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">explore</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">extras</h2>
        <p className="mt-1 text-[13px] text-text-muted">discover all facets of the rippl environmental ecosystem.</p>
      </div>

      <div className="space-y-3 mb-6">
        {links.map((link, i) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setActiveTab(link.id as any)}
            className="w-full flex items-center gap-4 p-4 rounded-[22px] gallery-card border border-border hover:border-border-active transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-2xl bg-surface-overlay flex items-center justify-center shrink-0">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[15px] text-text-primary leading-snug">{link.label}</h3>
              <p className="font-body text-[12px] text-text-muted mt-0.5 truncate">{link.desc}</p>
            </div>
            <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="expressive-card forest-card p-6 md:p-8 rounded-[30px] text-white shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 text-white border border-white/20">
          <Heart size={22} className="fill-white/30" />
        </div>
        <h3 className="font-display text-[20px] text-white font-semibold leading-tight">restoring native habitats</h3>
        <p className="font-body text-[13px] text-white/90 mt-2 mb-6 max-w-sm mx-auto">
          every action logged directly contributes to our verified coastal mangrove and reforestation milestones.
        </p>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <DotNumber value="12.4" className="text-white fill-white h-7" />
              <span className="font-display text-[15px] font-bold text-white">k</span>
            </div>
            <p className="font-body text-[11px] text-white/80 mt-1">trees planted</p>
          </div>
          <div className="w-px h-8 bg-white/25" />
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <DotNumber value="38.2" className="text-white fill-white h-7" />
              <span className="font-display text-[15px] font-bold text-white">tons</span>
            </div>
            <p className="font-body text-[11px] text-white/80 mt-1">carbon locked</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
