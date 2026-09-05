import { useApp } from '../App'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { navTabs } from './navigation'

/* Compact mobile counterpart to the desktop sidebar. */
export function BottomNav() {
  const { activeTab, setActiveTab, isAdmin } = useApp()

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-24px)] max-w-[370px] -translate-x-1/2 lg:hidden">
      <nav aria-label="Mobile navigation" className="mobile-glass-nav flex items-center justify-around gap-1 rounded-lg border border-border bg-surface-glass p-1.5 backdrop-blur-2xl">
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label.toLowerCase()}
              title={tab.label.toLowerCase()}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-w-12 flex-col items-center gap-0.5 rounded-md px-2 py-2 transition-colors active:scale-95"
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
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            aria-label="admin"
            title="admin"
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-md transition-all duration-300 active:scale-95 ${activeTab === 'admin' ? '' : 'opacity-50'}`}
          >
            {activeTab === 'admin' && (
              <motion.div
                layoutId="navIndicator"
                className="gallery-nav-active absolute inset-0 rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Shield size={20} className={`relative transition-colors duration-300 ${activeTab === 'admin' ? 'gallery-nav-text-active' : 'text-text-muted'}`} />
          </button>
        )}
      </nav>
    </div>
  )
}
