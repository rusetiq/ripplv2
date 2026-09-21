import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { Me } from './api'

export type Tab = 'feed' | 'log' | 'rewards' | 'rank' | 'impact' | 'profile' | 'admin' | 'privacy' | 'pricing' | 'corporate' | 'partnerships' | 'extras' | 'terms'

interface AppContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  points: number
  co2Saved: number
  waterSaved: number
  streak: number
  level: number
  darkMode: boolean
  setDarkMode: (d: boolean) => void
  syncError: string | null
  user: User | null
  me: Me | null
  isAdmin: boolean
  /* Mutations return the updated profile, so a tab can push it straight into
     context instead of waiting for the next revalidation. */
  applyMe: (next: Me) => void
  refreshMe: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  showSignIn: boolean
  setShowSignIn: (v: boolean) => void
}

export const AppContext = createContext<AppContextType>({} as AppContextType)
export const useApp = () => useContext(AppContext)

