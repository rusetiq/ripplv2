import { useState, createContext, useContext, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import { AppShell } from './components/AppShell'
import { FeedTab } from './tabs/FeedTab'
import { LogTab } from './tabs/LogTab'
import { RewardsTab } from './tabs/RewardsTab'
import { RankTab } from './tabs/RankTab'
import { ImpactTab } from './tabs/ImpactTab'
import { ProfileTab } from './tabs/ProfileTab'
import { AdminTab } from './tabs/AdminTab'
import { PrivacyTab } from './tabs/PrivacyTab'
import { PricingTab } from './tabs/PricingTab'
import { CorporateTab } from './tabs/CorporateTab'
import { PartnershipsTab } from './tabs/PartnershipsTab'
import { ExtrasTab } from './tabs/ExtrasTab'
import { TermsTab } from './tabs/TermsTab'
import { SignInModal } from './components/SignInModal'
import { auth, db, googleProvider } from './firebase'
import { signInWithPopup, onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth'
import { doc, onSnapshot, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore'

type Tab = 'feed' | 'log' | 'rewards' | 'rank' | 'impact' | 'profile' | 'admin' | 'privacy' | 'pricing' | 'corporate' | 'partnerships' | 'extras' | 'terms'

interface AppContextType {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  points: number
  addPoints: (n: number) => void
  co2Saved: number
  addCo2: (n: number) => void
  streak: number
  level: number
  waterSaved: number
  addWater: (n: number) => void
  darkMode: boolean
  setDarkMode: (d: boolean) => void
  syncError: string | null
  user: User | null
  userData: UserData | null
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  showSignIn: boolean
  setShowSignIn: (v: boolean) => void
}

export interface UserData {
  displayName: string
  location: string
  photoURL: string
  email?: string
  points: number
  co2Saved: number
  waterSaved: number
  streak: number
  lastActiveDate: string
  badges: Record<string, { unlocked: boolean; progress: number }>
  redeemedRewards: string[]
  isAdmin?: boolean
}

export const AppContext = createContext<AppContextType>({} as AppContextType)
export const useApp = () => useContext(AppContext)

const emptyUserData: UserData = {
  displayName: '',
  location: '',
  photoURL: '',
  points: 0,
  co2Saved: 0,
  waterSaved: 0,
  streak: 0,
  lastActiveDate: '',
  badges: {},
  redeemedRewards: [],
  isAdmin: false,
}

const defaultBadges = {
  b1: { unlocked: false, progress: 0 },
  b2: { unlocked: false, progress: 0 },
  b3: { unlocked: false, progress: 0 },
  b4: { unlocked: false, progress: 0 },
  b5: { unlocked: false, progress: 0 },
  b6: { unlocked: false, progress: 0 },
  b7: { unlocked: false, progress: 0 },
  b8: { unlocked: false, progress: 0 },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('rippl-field-theme')
    return savedTheme ? savedTheme === 'dark' : false
  })
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userData, setUserData] = useState<UserData>(emptyUserData)
  const [ready, setReady] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authFinished, setAuthFinished] = useState(false)
  const [authFailed, setAuthFailed] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      setIsAdmin(fbUser ? (await fbUser.getIdTokenResult()).claims.admin === true : false)
      setReady(true)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) {
      setUserData(emptyUserData)
      return
    }
    const userRef = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      setSyncError(null)
      if (snap.exists()) {
        const data = snap.data() as UserData
        setUserData(data)
      } else {
        setDoc(userRef, {
          ...emptyUserData,
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
          email: user.email?.toLowerCase() ?? '',
          badges: defaultBadges,
          isAdmin: false,
        })
      }
    }, (error) => {
      console.warn('Unable to sync the user profile.', error)
      setSyncError('Your account could not sync. Please refresh or check your Firestore access.')
    })
    return unsub
  }, [user])

  const level = Math.floor(userData.points / 500) + 1

  useEffect(() => {
    if (!user || !userData || !userData.points) return
    const checkBadges = async () => {
      const userRef = doc(db, 'users', user.uid)
      const newBadges = { ...userData.badges }
      let updated = false

      if (userData.points > 0 && !newBadges.b1?.unlocked) { newBadges.b1 = { unlocked: true, progress: 100 }; updated = true }
      if (level >= 2 && !newBadges.b2?.unlocked) { newBadges.b2 = { unlocked: true, progress: 100 }; updated = true }
      if (userData.waterSaved >= 1000 && !newBadges.b3?.unlocked) { newBadges.b3 = { unlocked: true, progress: 100 }; updated = true }
      if (level >= 3 && !newBadges.b4?.unlocked) { newBadges.b4 = { unlocked: true, progress: 100 }; updated = true }
      if (userData.co2Saved >= 500 && !newBadges.b5?.unlocked) { newBadges.b5 = { unlocked: true, progress: 100 }; updated = true }
      if (userData.streak >= 30 && !newBadges.b6?.unlocked) { newBadges.b6 = { unlocked: true, progress: 100 }; updated = true }
      if (userData.co2Saved >= 1000 && !newBadges.b7?.unlocked) { newBadges.b7 = { unlocked: true, progress: 100 }; updated = true }
      if (level >= 5 && !newBadges.b8?.unlocked) { newBadges.b8 = { unlocked: true, progress: 100 }; updated = true }

      if (!newBadges.b2?.unlocked || !newBadges.b4?.unlocked) {
        const q = query(collection(db, 'userActions'), where('userId', '==', user.uid))
        const snap = await getDocs(q)
        let metroCount = 0
        let solarCount = 0
        snap.forEach(d => {
          const action = d.data().label?.toLowerCase() || ''
          if (action.includes('metro')) metroCount++
          if (action.includes('solar')) solarCount++
        })

        if (metroCount >= 10 && !newBadges.b2?.unlocked) { newBadges.b2 = { unlocked: true, progress: 100 }; updated = true }
        if (solarCount >= 5 && !newBadges.b4?.unlocked) { newBadges.b4 = { unlocked: true, progress: 100 }; updated = true }

        if (!newBadges.b2?.unlocked) {
          const p = Math.min(Math.floor((metroCount / 10) * 100), 99)
          if (p > (newBadges.b2?.progress || 0)) { newBadges.b2 = { unlocked: false, progress: p }; updated = true }
        }
        if (!newBadges.b4?.unlocked) {
          const p = Math.min(Math.floor((solarCount / 5) * 100), 99)
          if (p > (newBadges.b4?.progress || 0)) { newBadges.b4 = { unlocked: false, progress: p }; updated = true }
        }
      }

      if (updated) await updateDoc(userRef, { badges: newBadges })
    }
    checkBadges()
  }, [level, user, userData])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
    }
    localStorage.setItem('rippl-field-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const signInWithGoogle = async () => {
    setIsAuthenticating(true)
    setAuthFailed(false)
    try {
      await signInWithPopup(auth, googleProvider)
      setAuthFinished(true)
      setTimeout(() => {
        setIsAuthenticating(false)
        setAuthFinished(false)
      }, 1500)
    } catch {
      setAuthFailed(true)
      setTimeout(() => {
        setIsAuthenticating(false)
        setAuthFailed(false)
      }, 1500)
    }
  }

  const signOut = async () => {
    await fbSignOut(auth)
  }

  const addPoints = async (n: number) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    const today = new Date().toISOString().split('T')[0]
    const updates: Record<string, any> = { points: increment(n) }
    if (userData.lastActiveDate !== today) {
      updates.streak = increment(1)
      updates.lastActiveDate = today
    }
    await updateDoc(userRef, updates)
  }

  const addCo2 = async (n: number) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { co2Saved: increment(n) })
  }

  const addWater = async (n: number) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { waterSaved: increment(n) })
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'feed': return <FeedTab />
      case 'log': return <LogTab />
      case 'rewards': return <RewardsTab />
      case 'rank': return <RankTab />
      case 'impact': return <ImpactTab />
      case 'profile': return <ProfileTab />
      case 'admin': return <AdminTab />
      case 'privacy': return <PrivacyTab />
      case 'pricing': return <PricingTab />
      case 'corporate': return <CorporateTab />
      case 'partnerships': return <PartnershipsTab />
      case 'extras': return <ExtrasTab />
      case 'terms': return <TermsTab />
    }
  }

  if (!ready) {
    return (
      <div className="h-full w-full max-w-[430px] mx-auto bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-[10px] text-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      points: userData.points, addPoints,
      co2Saved: userData.co2Saved, addCo2,
      streak: userData.streak,
      level,
      waterSaved: userData.waterSaved, addWater,
      darkMode, setDarkMode,
      syncError,
      user, userData,
      isAdmin,
      signInWithGoogle, signOut,
      showSignIn, setShowSignIn,
    }}>
      <AnimatePresence>
        {isAuthenticating && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border border-border/80 bg-surface/90 backdrop-blur-md"
          >
            {authFinished ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-oasis-500/20 text-oasis-400">
                <Check size={12} strokeWidth={2.5} />
              </span>
            ) : authFailed ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400">
                <AlertCircle size={12} strokeWidth={2.5} />
              </span>
            ) : (
              <Loader2 size={14} className="animate-spin text-text-muted" />
            )}
            <span className="font-body text-[12px] font-medium text-text-primary">
              {authFinished ? 'Signed in successfully' : authFailed ? 'Authentication failed' : 'Signing in with Google...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell>
        <AnimatePresence mode="wait">
          {renderTab()}
        </AnimatePresence>
      </AppShell>
      <SignInModal />
    </AppContext.Provider>
  )
}

export default App
