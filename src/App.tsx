import { useState, useEffect, useCallback, lazy, Suspense, startTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import { DotLoader } from './components/DotLoader'
import { AppShell } from './components/AppShell'
import { FeedTab } from './tabs/FeedTab'
import { SignInModal } from './components/SignInModal'
import { auth, googleProvider } from './firebase'
import { signInWithPopup, onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth'
import { api, type Me } from './api'
import { useLive } from './useLive'
import { AppContext, type Tab } from './AppContext'

/* Only the tab that opens first is part of the initial payload; the rest arrive
   as their own chunks. They are warmed on idle so a tab switch still feels
   instant on a fast connection, and startTransition keeps the current tab on
   screen while a cold one downloads. */
const LogTab = lazy(() => import('./tabs/LogTab').then(m => ({ default: m.LogTab })))
const RewardsTab = lazy(() => import('./tabs/RewardsTab').then(m => ({ default: m.RewardsTab })))
const RankTab = lazy(() => import('./tabs/RankTab').then(m => ({ default: m.RankTab })))
const ImpactTab = lazy(() => import('./tabs/ImpactTab').then(m => ({ default: m.ImpactTab })))
const ProfileTab = lazy(() => import('./tabs/ProfileTab').then(m => ({ default: m.ProfileTab })))
const AdminTab = lazy(() => import('./tabs/AdminTab').then(m => ({ default: m.AdminTab })))
const PrivacyTab = lazy(() => import('./tabs/PrivacyTab').then(m => ({ default: m.PrivacyTab })))
const PricingTab = lazy(() => import('./tabs/PricingTab').then(m => ({ default: m.PricingTab })))
const CorporateTab = lazy(() => import('./tabs/CorporateTab').then(m => ({ default: m.CorporateTab })))
const PartnershipsTab = lazy(() => import('./tabs/PartnershipsTab').then(m => ({ default: m.PartnershipsTab })))
const ExtrasTab = lazy(() => import('./tabs/ExtrasTab').then(m => ({ default: m.ExtrasTab })))
const TermsTab = lazy(() => import('./tabs/TermsTab').then(m => ({ default: m.TermsTab })))

const warmTabs = () => {
  // Prefetching costs the user data, so it is skipped on a metered or slow
  // connection; those tabs still load on demand.
  const link = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (link?.saveData || (link?.effectiveType && /(^|-)2g$/.test(link.effectiveType))) return
  void import('./tabs/LogTab')
  void import('./tabs/ProfileTab')
  void import('./tabs/RewardsTab')
  void import('./tabs/RankTab')
  void import('./tabs/ExtrasTab')
  void import('./tabs/ImpactTab')
}

function App() {
  const [activeTab, setRawActiveTab] = useState<Tab>(() => window.location.pathname === '/app/terms' ? 'terms' : window.location.pathname === '/app/privacy' ? 'privacy' : 'feed')
  const setActiveTab = useCallback((tab: Tab) => { startTransition(() => setRawActiveTab(tab)) }, [])
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('rippl-field-theme')
    return savedTheme ? savedTheme === 'dark' : false
  })
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authFinished, setAuthFinished] = useState(false)
  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    const handle = idle(warmTabs)
    return () => window.cancelIdleCallback?.(handle as number)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, fbUser => {
      setUser(fbUser)
      setReady(true)
    })
    return unsub
  }, [])

  /* The profile is the one thing worth keeping warm: points and streak change
     from the user's own actions, so it revalidates on focus like everything
     else but on a slower timer. */
  const profile = useLive<Me>(signal => api.me(signal), [user?.uid], { enabled: !!user, intervalMs: 120_000 })
  const me = profile.data

  const applyMe = useCallback((next: Me) => profile.set(() => next), [profile])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
    }
    /* Safari paints the area above and below the page (the status bar in
       standalone mode, the rubber-band overscroll everywhere) with the theme
       colour, so it has to follow the in-app switch rather than the OS. */
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#15191b' : '#e9ecea')
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
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-surface">
        <div role="status" className="text-center">
          <DotLoader size={44} className="text-oasis-400 mx-auto mb-4" />
          <p className="font-mono text-[10px] text-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      points: me?.points ?? 0,
      co2Saved: me?.co2Saved ?? 0,
      waterSaved: me?.waterSaved ?? 0,
      streak: me?.streak ?? 0,
      level: me?.level ?? 1,
      darkMode, setDarkMode,
      syncError: profile.error,
      user, me,
      isAdmin: me?.isAdmin ?? false,
      applyMe, refreshMe: profile.refresh,
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
            className="app-toast fixed left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border/80 bg-surface/90 px-4 py-2.5 shadow-lg backdrop-blur-md"
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
              <DotLoader size={20} className="text-text-muted" />
            )}
            <span className="font-body text-[12px] font-medium text-text-primary">
              {authFinished ? 'Signed in successfully' : authFailed ? 'Authentication failed' : 'Signing in with Google...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell>
        <Suspense fallback={<TabFallback />}>
          <AnimatePresence mode="wait">
            {renderTab()}
          </AnimatePresence>
        </Suspense>
      </AppShell>
      <SignInModal />
    </AppContext.Provider>
  )
}

function TabFallback() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] items-center justify-center">
      <span className="sr-only">Loading</span>
      <DotLoader className="text-oasis-400" />
    </div>
  )
}

export default App
