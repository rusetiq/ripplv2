import { type ReactNode, useEffect } from 'react'
import { BottomNav } from './BottomNav'
import { StatusBar } from './StatusBar'
import { AlertCircle } from 'lucide-react'
import { useApp } from '../AppContext'
import '../dashboard.css'

export function AppShell({ children }: { children: ReactNode }) {
  const { syncError } = useApp()

  useEffect(() => {
    document.documentElement.classList.add('in-app')
    document.body.classList.add('in-app')
    return () => {
      document.documentElement.classList.remove('in-app')
      document.body.classList.remove('in-app')
    }
  }, [])

  return <div className="app-gallery dashboard-shell">
    <StatusBar />
    <main className="dashboard-main" id="dashboard-content">
      <div className="dashboard-content">
        {syncError && <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-red-500"><AlertCircle size={15}/><p className="text-sm">{syncError}</p></div>}
        {children}
      </div>
    </main>
    <BottomNav />
  </div>
}
