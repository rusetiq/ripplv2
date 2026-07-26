import { useApp } from '../App'
import { motion } from 'framer-motion'
import { Newspaper, ClipboardList, Trophy, User, Gift, Shield, MoreHorizontal } from 'lucide-react'

const tabs = [
  { id: 'feed' as const, label: 'Feed', icon: Newspaper },
  { id: 'log' as const, label: 'Log', icon: ClipboardList },
  { id: 'rewards' as const, label: 'Rewards', icon: Gift },
  { id: 'rank' as const, label: 'Rank', icon: Trophy },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'extras' as const, label: 'Extras', icon: MoreHorizontal },
]

export function BottomNav() {
  const { activeTab, setActiveTab, userData } = useApp()
  const isAdmin = (userData as any)?.isAdmin

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[400px]">
      <nav
        className="flex items-center justify-around px-2 py-2 rounded-[999px] border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.1)] backdrop-blur-[30px] backdrop-saturate-[150%] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.3)]"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-full transition-all duration-300 active:scale-90"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-oasis-400/20 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-colors duration-300 mix-blend-difference ${isActive ? 'text-oasis-400' : 'text-white opacity-70'}`}
              />
              <span className={`font-mono text-[8px] font-bold tracking-[0.1em] uppercase transition-colors duration-300 mix-blend-difference ${isActive ? 'text-oasis-400' : 'text-white opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-full transition-all duration-300 active:scale-90 ${activeTab === 'admin' ? '' : 'opacity-50'}`}
          >
            {activeTab === 'admin' && (
              <motion.div
                layoutId="navIndicator"
                className="absolute inset-0 bg-oasis-400/20 rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Shield size={18} className={`transition-colors duration-300 mix-blend-difference ${activeTab === 'admin' ? 'text-oasis-400' : 'text-white'}`} />
            <span className={`font-mono text-[8px] font-bold tracking-[0.1em] uppercase transition-colors duration-300 mix-blend-difference ${activeTab === 'admin' ? 'text-oasis-400' : 'text-white'}`}>Admin</span>
          </button>
        )}
      </nav>
    </div>
  )
}
