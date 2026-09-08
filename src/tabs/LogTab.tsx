import { motion, AnimatePresence } from 'framer-motion'
import { Train, Leaf, Zap, Droplets, Trash2, Plus, Check, Car, Bike, Footprints, Utensils, Recycle, ShoppingBag, Package, Sun, Snowflake, Plug, Lightbulb, Bath, Wrench, Droplet, Shirt, Gift, Ban, Camera, X, LogIn, AlertTriangle, ShieldX } from 'lucide-react'
import { useState, useRef } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { verifyActionPhoto } from '../gemini'
import { compressImage } from '../utils'

interface Action {
  id: string
  label: string
  points: number
  co2: number
  water: number
  Icon: React.ElementType
}

interface Category {
  id: string
  label: string
  icon: typeof Train
  gradientClass: string
  color: string
  bg: string
  actions: Action[]
}

const categories: Category[] = [
  {
    id: 'transport',
    label: 'Transport',
    icon: Train,
    gradientClass: 'sapphire-card',
    color: 'text-gulf-400',
    bg: 'bg-gulf-400/10',
    actions: [
      { id: 't1', label: 'Metro commute', points: 35, co2: 2.4, water: 0, Icon: Train },
      { id: 't2', label: 'Carpooled', points: 25, co2: 1.8, water: 0, Icon: Car },
      { id: 't3', label: 'Cycled to destination', points: 40, co2: 3.1, water: 0, Icon: Bike },
      { id: 't4', label: 'Walked instead of drove', points: 20, co2: 1.2, water: 0, Icon: Footprints },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    icon: Leaf,
    gradientClass: 'forest-card',
    color: 'text-oasis-400',
    bg: 'bg-oasis-400/10',
    actions: [
      { id: 'f1', label: 'Plant-based meal', points: 20, co2: 1.1, water: 0, Icon: Utensils },
      { id: 'f2', label: 'No food waste today', points: 15, co2: 0.5, water: 0, Icon: Recycle },
      { id: 'f3', label: 'Local produce shopping', points: 25, co2: 0.8, water: 0, Icon: ShoppingBag },
      { id: 'f4', label: 'Brought reusable container', points: 10, co2: 0.2, water: 0, Icon: Package },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: Zap,
    gradientClass: 'solar-card',
    color: 'text-dune-400',
    bg: 'bg-dune-400/10',
    actions: [
      { id: 'e1', label: 'Solar energy used', points: 80, co2: 6.8, water: 0, Icon: Sun },
      { id: 'e2', label: 'AC at 24°C', points: 30, co2: 2.0, water: 0, Icon: Snowflake },
      { id: 'e3', label: 'Unplugged devices', points: 10, co2: 0.3, water: 0, Icon: Plug },
      { id: 'e4', label: 'LED lighting switch', points: 15, co2: 0.5, water: 0, Icon: Lightbulb },
    ],
  },
  {
    id: 'water',
    label: 'Water',
    icon: Droplets,
    gradientClass: 'aurora-card',
    color: 'text-gulf-300',
    bg: 'bg-gulf-300/10',
    actions: [
      { id: 'w1', label: 'Short shower (< 5min)', points: 25, co2: 0, water: 60, Icon: Bath },
      { id: 'w2', label: 'Fixed a leak', points: 50, co2: 0, water: 200, Icon: Wrench },
      { id: 'w3', label: 'Reused greywater', points: 35, co2: 0, water: 100, Icon: Droplet },
      { id: 'w4', label: 'Full load laundry only', points: 15, co2: 0, water: 40, Icon: Shirt },
    ],
  },
  {
    id: 'waste',
    label: 'Waste',
    icon: Trash2,
    gradientClass: 'twilight-card',
    color: 'text-ember-400',
    bg: 'bg-ember-400/10',
    actions: [
      { id: 'r1', label: 'Recycled materials', points: 20, co2: 0.9, water: 0, Icon: Recycle },
      { id: 'r2', label: 'Composted organics', points: 30, co2: 1.5, water: 0, Icon: Leaf },
      { id: 'r3', label: 'Refused single-use plastic', points: 15, co2: 0.3, water: 0, Icon: Ban },
      { id: 'r4', label: 'Donated old items', points: 25, co2: 1.2, water: 0, Icon: Gift },
    ],
  },
]

const impactLabels: Record<string, (a: Action) => string> = {
  transport: (a) => `${a.co2} kg CO₂`,
  food: (a) => `${a.co2} kg CO₂`,
  energy: (a) => `${a.co2} kg CO₂`,
  water: (a) => `${a.water}L saved`,
  waste: (a) => `${a.co2} kg CO₂`,
}

export function LogTab() {
  const { addPoints, addCo2, addWater, user, setShowSignIn } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<string>('transport')
  const [loggedActions, setLoggedActions] = useState<Set<string>>(new Set())
  const [justLogged, setJustLogged] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [logging, setLogging] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [isAutoLogging, setIsAutoLogging] = useState(false)
  const [autoLogSuccess, setAutoLogSuccess] = useState(false)
  const [autoLogFailed, setAutoLogFailed] = useState(false)
  const [autoLogActionName, setAutoLogActionName] = useState('')
  const [autoLogPoints, setAutoLogPoints] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const activeCategory = categories.find(c => c.id === selectedCategory)!

  if (!user) {
    return (
      <motion.div
        key="log-guest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pb-2"
      >
        <div className="mb-5 pt-1">
          <p className="gallery-label mb-1.5 text-text-muted">new entry</p>
          <h2 className="font-display text-[26px] leading-tight text-text-primary">log an action</h2>
          <p className="mt-1 text-[13px] text-text-muted">track everyday wins for personal impact</p>
        </div>
        <div className="expressive-card aurora-card flex flex-col items-center justify-center rounded-[34px] p-7 text-center text-white shadow-xl sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
            <LogIn size={26} strokeWidth={2} />
          </div>
          <p className="font-display text-[22px] text-white mb-2">sign in to record actions</p>
          <p className="font-body text-[13px] text-white/90 mb-6 max-w-[300px] leading-relaxed">
            track everyday habits, verify your progress, and earn community points toward net zero.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="gradient-card-action inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-body text-[13px] font-semibold shadow-md active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            <span>continue with google</span>
          </button>
        </div>
      </motion.div>
    )
  }

  const MIN_CONFIDENCE = 60

  const executeLog = async (action: Action, points: number, category: string) => {
    setLoggedActions(prev => new Set(prev).add(action.id))
    setJustLogged(action.id)
    addPoints(points)
    if (action.co2 > 0) addCo2(action.co2)
    if (action.water > 0) addWater(action.water)

    await addDoc(collection(db, 'posts'), {
      userId: user.uid,
      userName: user.displayName || '',
      userAvatar: (user.displayName || 'U').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase(),
      category,
      action: action.label,
      impact: impactLabels[category]?.(action) ?? '',
      points,
      likesCount: 0,
      commentsCount: 0,
      ripplesCount: 0,
      imageBase64: pendingImage,
      timestamp: serverTimestamp(),
    })

    await addDoc(collection(db, 'userActions'), {
      userId: user.uid,
      actionId: action.id,
      category,
      label: action.label,
      points,
      co2: action.co2,
      water: action.water,
      imageBase64: pendingImage,
      timestamp: serverTimestamp(),
    })

    setPendingImage(null)
    setVerifying(false)
    setLogging(null)
    setTimeout(() => setJustLogged(null), 1400)
  }

  const handleLog = async (action: Action) => {
    if (loggedActions.has(action.id) || logging || verifying) return
    setLogging(action.id)
    setVerifying(true)

    const result = await verifyActionPhoto(pendingImage!)

    if (result.confidence < MIN_CONFIDENCE) {
      setVerifyError(`Verification confidence was ${result.confidence}%. Please submit a clearer photo demonstrating your action.`)
      setLogging(null)
      setVerifying(false)
      return
    }

    if (result.category !== selectedCategory) {
      setVerifyError(`Photo shows "${result.action}" (${result.category}), not ${selectedCategory}.`)
      setLogging(null)
      setVerifying(false)
      return
    }

    await executeLog(action, result.points || action.points, selectedCategory)
  }

  const handleAutoLog = async (imgArg?: string | React.MouseEvent) => {
    const targetImage = typeof imgArg === 'string' ? imgArg : pendingImage
    if (!targetImage) {
      setPhotoError(true)
      return
    }
    setPhotoError(false)
    setVerifyError(null)
    setVerifying(true)
    setIsAutoLogging(true)
    setAutoLogSuccess(false)
    setAutoLogFailed(false)
    setAutoLogActionName('')
    setAutoLogPoints(0)

    const result = await verifyActionPhoto(targetImage)

    if (result.confidence < MIN_CONFIDENCE) {
      setVerifyError(`Low confidence (${result.confidence}%). Could not reliably recognize action.`)
      setVerifying(false)
      setAutoLogFailed(true)
      setTimeout(() => {
        setIsAutoLogging(false)
        setAutoLogFailed(false)
      }, 1500)
      return
    }

    let action = categories.flatMap(c => c.actions).find(a => a.label.toLowerCase().includes(result.action.toLowerCase()))
    let catId = categories.find(c => action && c.actions.includes(action))?.id

    if (!action) {
      catId = categories.find(c => c.id === result.category)?.id || 'transport'
      const cat = categories.find(c => c.id === catId)!
      action = {
        id: `auto-${Date.now()}`,
        label: result.action,
        points: result.points,
        co2: 0,
        water: 0,
        Icon: cat.icon
      }
    }

    setSelectedCategory(catId!)
    setLogging(action.id)
    await executeLog(action, result.points, catId!)

    setAutoLogActionName(action.label)
    setAutoLogPoints(result.points)
    setAutoLogSuccess(true)
    setTimeout(() => {
      setIsAutoLogging(false)
      setAutoLogSuccess(false)
    }, 1500)
  }

  const handleImagePick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset the input so picking the same photo twice still fires a change.
    e.target.value = ''
    if (!file) return
    try {
      const base64 = await compressImage(file)
      setPendingImage(base64)
      setPhotoError(false)
      setVerifyError(null)
      handleAutoLog(base64)
    } catch {
      setPendingImage(null)
      setVerifyError('That photo could not be read on this device. Try taking a new one, or pick a JPEG or PNG.')
    }
  }

  return (
    <motion.div
      key="log"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-2"
    >
      <AnimatePresence>
        {isAutoLogging && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="app-toast fixed left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-[#162722]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
          >
            {autoLogSuccess ? (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-oasis-400 text-surface shadow-xs">
                <Check size={14} strokeWidth={3} />
              </span>
            ) : autoLogFailed ? (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-400 text-surface shadow-xs">
                <ShieldX size={14} strokeWidth={3} />
              </span>
            ) : (
              <div className="w-4 h-4 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin" />
            )}
            <div className="flex items-center gap-2.5">
              <span className="font-body text-[13px] font-medium text-white">
                {autoLogSuccess ? `${autoLogActionName.toLowerCase()}` : autoLogFailed ? 'verification failed' : 'verifying action proof...'}
              </span>
              {autoLogSuccess && autoLogPoints > 0 && (
                <span className="font-mono text-[11px] text-oasis-300 font-bold px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20">
                  +{autoLogPoints} pts
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">new entry</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">log an action</h2>
        <p className="mt-1 text-[13px] text-text-muted">attach a quick photo, then tap to record your impact.</p>
      </div>

      <div className="category-rail mb-6 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.id
          const activeBg = cat.id === 'transport' ? 'bg-[#2563eb]' :
            cat.id === 'food' ? 'bg-[#059669]' :
            cat.id === 'energy' ? 'bg-[#d97706]' :
            cat.id === 'water' ? 'bg-[#0284c7]' : 'bg-[#475569]'

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-[12px] transition-all duration-150 ${
                isActive
                  ? `${activeBg} text-white font-semibold shadow-md`
                  : 'bg-surface-raised/70 text-text-muted hover:text-text-primary border border-border/70 hover:bg-surface-raised font-medium'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-text-muted'} />
              <span>{cat.label.toLowerCase()}</span>
            </button>
          )
        })}
      </div>

      <motion.div
        layout
        className={`expressive-card ${activeCategory.gradientClass} p-6 md:p-8 mb-6 rounded-[34px] shadow-xl text-white relative transition-all duration-300`}
      >
        {pendingImage && (
          <div className="mb-4 flex justify-end">
            <span className="rounded-full bg-white/15 px-3 py-0.5 font-body text-[11px] text-white/90 backdrop-blur-md">
              photo ready
            </span>
          </div>
        )}

        {pendingImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/25 flex justify-center bg-black/30 mb-4">
            <img src={pendingImage} alt="Proof" className="max-h-[45vh] w-full object-contain" />
            <button
              onClick={() => { setPendingImage(null); setPhotoError(false); setVerifyError(null) }}
              aria-label="remove photo"
              className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <X size={17} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white">
              <Camera size={26} strokeWidth={1.8} />
            </div>
            <p className="font-display text-[18px] text-white leading-tight">
              photo evidence required
            </p>
            <p className="font-body text-[12px] text-white/85 mt-1.5 max-w-[280px] leading-relaxed">
              snap your reusable cup, metro card, solar inverter, or plant meal to auto-verify points.
            </p>
            {photoError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 mt-3 px-3.5 py-1 rounded-full bg-red-500/30 border border-red-300/40 text-white font-body text-[11px]"
              >
                <AlertTriangle size={12} />
                <span>please attach or snap a photo first</span>
              </motion.div>
            )}
          </div>
        )}

        <button
          onClick={pendingImage ? handleAutoLog : handleImagePick}
          className="gradient-card-action flex min-h-14 w-full items-center justify-center gap-2 rounded-full py-4 font-body text-[13px] font-semibold shadow-lg transition-all active:scale-[0.98]"
        >
          <Camera size={16} />
          <span>{pendingImage ? 'auto-verify with gemini ai' : 'take or upload photo'}</span>
        </button>
      </motion.div>

      {verifyError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 mb-6 p-4 rounded-2xl border border-red-400/30 bg-red-400/10 text-text-primary"
        >
          <ShieldX size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[13px] font-semibold text-red-400">verification note</p>
            <p className="font-body text-[12px] text-text-secondary mt-0.5 leading-relaxed">{verifyError}</p>
          </div>
        </motion.div>
      )}

      {pendingImage && verifying && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-oasis-400/30 bg-oasis-400/10"
        >
          <div className="w-5 h-5 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="font-body text-[13px] text-text-primary font-medium">analyzing sustainability proof with AI...</p>
        </motion.div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mb-3 flex items-center justify-between">
        <p className="gallery-label text-text-muted">actions · {activeCategory.label.toLowerCase()}</p>
        <span className="font-body text-[11px] text-text-muted">tap action to log</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-3"
        >
          {activeCategory.actions.map((action) => {
            const isLogged = loggedActions.has(action.id)
            const isJust = justLogged === action.id
            const isLoading = logging === action.id
            const hasPhoto = !!pendingImage

            return (
              <motion.button
                key={action.id}
                layout
                whileHover={{ scale: 1.012, y: -1 }}
                whileTap={{ scale: 0.988 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                onClick={() => handleLog(action)}
                disabled={isLogged || isLoading || verifying || !hasPhoto}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[26px] border p-3.5 text-left transition-all duration-200 sm:gap-4 sm:p-4 ${isLogged
                    ? 'bg-oasis-500/15 border-oasis-500/35 shadow-sm'
                    : !hasPhoto || verifying
                      ? 'bg-surface-raised/40 border-border/60 opacity-60 cursor-not-allowed'
                      : 'bg-surface-raised/80 border-border hover:border-border-active hover:bg-surface-overlay hover:shadow-md cursor-pointer'
                  }`}
              >
                <div className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl transition-transform group-hover:scale-105 ${isLogged
                    ? 'bg-oasis-400 text-surface'
                    : hasPhoto && !verifying
                      ? 'bg-surface-overlay text-text-primary border border-border'
                      : 'bg-surface-overlay/50 text-text-muted'
                  }`}>
                  <action.Icon size={19} strokeWidth={1.9} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`font-display text-[14px] leading-snug ${isLogged ? 'text-oasis-400 font-semibold' : hasPhoto && !verifying ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                    {action.label.toLowerCase()}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${isLogged
                        ? 'bg-oasis-400/20 text-oasis-400 border border-oasis-400/30'
                        : 'bg-surface-overlay text-text-muted border border-border'
                      }`}>
                      +{action.points} pts
                    </span>
                    {action.co2 > 0 && (
                      <span className="font-body text-[11px] text-text-muted">{action.co2} kg CO₂</span>
                    )}
                    {action.water > 0 && (
                      <span className="font-body text-[11px] text-text-muted">{action.water}L saved</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${isLogged
                      ? 'bg-oasis-400 text-surface shadow-sm'
                      : isLoading
                        ? 'bg-surface-overlay'
                        : 'bg-surface-overlay border border-border text-text-muted group-hover:border-text-muted'
                    }`}>
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-4 h-4 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin"
                        />
                      ) : isLogged ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <Check size={16} strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <Plus size={15} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {isJust && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-[26px] border-2 border-oasis-400 pointer-events-none"
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
