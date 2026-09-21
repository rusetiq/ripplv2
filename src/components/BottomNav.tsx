import { useApp } from '../AppContext'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { navTabs } from './navigation'

/* Compact mobile counterpart to the desktop sidebar. The dock class carries the
   safe-area offset so the bar floats above the iPhone home indicator. */
export function BottomNav() {
  const { activeTab, setActiveTab, isAdmin } = useApp()
  const tabs = isAdmin
    ? [...navTabs, { id: 'admin' as const, label: 'Admin', icon: Shield }]
    : navTabs

  return (
    <div className="mobile-nav-dock lg:hidden">
      <nav aria-label="Mobile navigation" className="mobile-glass-nav flex items-center rounded-lg border border-border bg-surface-glass backdrop-blur-2xl">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label.toLowerCase()}
              title={tab.label.toLowerCase()}
              aria-current={isActive ? 'page' : undefined}
              className="relative rounded-md transition-transform active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="gallery-nav-active absolute inset-0 rounded-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={1.6}
                className={`relative transition-colors duration-300 ${isActive ? 'gallery-nav-text-active' : 'text-text-muted'}`}
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
