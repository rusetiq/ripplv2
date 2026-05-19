import { useState, createContext, useContext, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
import { LandingPage } from './LandingPage'
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
  user: User | null
  userData: UserData | null
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
  const [darkMode, setDarkMode] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData>(emptyUserData)
  const [ready, setReady] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authFinished, setAuthFinished] = useState(false)
  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser)
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
          if (snap.exists()) {
            const data = snap.data() as UserData
            setUserData(data)
            if (user.email) {
              const email = user.email.toLowerCase()
              const updates: any = {}
              if ((data as any).email !== email) updates.email = email
              if (email === 'aarush.uae@gmail.com' && !data.isAdmin) updates.isAdmin = true
              
              if (Object.keys(updates).length > 0) {
                updateDoc(userRef, updates).catch(() => {})
              }
            }
          } else {
        setDoc(userRef, {
          ...emptyUserData,
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
          email: user.email?.toLowerCase() ?? '',
          badges: defaultBadges,
          isAdmin: user.email?.toLowerCase() === 'aarush.uae@gmail.com',
        })
      }
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
      user, userData,
      signInWithGoogle, signOut,
      showSignIn, setShowSignIn,
    }}>
      <AnimatePresence>
        {isAuthenticating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${authFinished ? 'bg-[#b7ff3c]' : authFailed ? 'bg-red-500' : 'bg-surface'}`}
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-display text-[42px] tracking-widest mb-8 transition-colors duration-700 ${authFinished || authFailed ? 'text-[#07110d]' : 'text-[#b7ff3c]'}`}
            >
              RIPPL
            </motion.h1>
            
            <div className="w-48 h-1 bg-surface-raised rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: authFinished || authFailed ? '0%' : '100%' }}
                transition={{ repeat: authFinished || authFailed ? 0 : Infinity, duration: 1.5, ease: "linear" }}
                className={`absolute inset-0 transition-colors duration-700 ${authFinished || authFailed ? 'bg-[#07110d]' : 'bg-[#b7ff3c]'}`}
              />
            </div>
            
            <p className={`font-mono text-[10px] uppercase tracking-[0.2em] mt-4 transition-colors duration-700 ${authFinished || authFailed ? 'text-[#07110d]' : 'text-text-muted'}`}>
              {authFinished ? 'Authenticated' : authFailed ? 'Authentication Failed' : 'authenticating...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {user ? (
        <AppShell>
          <AnimatePresence mode="wait">
            {renderTab()}
          </AnimatePresence>
        </AppShell>
      ) : (
        <LandingPage />
      )}
      <SignInModal />
    </AppContext.Provider>
  )
}

export default App
