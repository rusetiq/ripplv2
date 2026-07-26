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
  color: string
  bg: string
  ring: string
  actions: Action[]
}

const categories: Category[] = [
  {
    id: 'transport',
    label: 'Transport',
    icon: Train,
    color: 'text-gulf-400',
    bg: 'bg-gulf-400/10',
    ring: 'ring-gulf-400/30',
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
    color: 'text-oasis-400',
    bg: 'bg-oasis-400/10',
    ring: 'ring-oasis-400/30',
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
    color: 'text-dune-400',
    bg: 'bg-dune-400/10',
    ring: 'ring-dune-400/30',
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
    color: 'text-gulf-300',
    bg: 'bg-gulf-300/10',
    ring: 'ring-gulf-300/30',
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
    color: 'text-ember-400',
    bg: 'bg-ember-400/10',
    ring: 'ring-ember-400/30',
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
        key="log"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-4"
      >
        <div className="mb-4 pt-1">
          <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">LOG ACTION</h2>
          <p className="font-mono text-[10px] text-text-muted mt-0.5">track your daily impact</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LogIn size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Sign in to log actions</p>
          <p className="font-mono text-[10px] text-text-muted mb-6 max-w-[240px]">
            Track your eco-friendly habits and earn points toward Net Zero 2050.
          </p>
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-2 bg-surface-raised hover:bg-surface-overlay border border-border rounded-xl px-5 py-2.5 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-body text-[13px] text-text-primary">Sign in with Google</span>
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
    setTimeout(() => setJustLogged(null), 1500)
  }

  const handleLog = async (action: Action) => {
    if (loggedActions.has(action.id) || logging || verifying) return
    setLogging(action.id)
    setVerifying(true)

    const result = await verifyActionPhoto(pendingImage!)

    if (result.confidence < MIN_CONFIDENCE) {
      setVerifyError(`Verification failed (${result.confidence}% confidence). Photo doesn't clearly show a valid sustainability action.`)
      setLogging(null)
      setVerifying(false)
      return
    }

    if (result.category !== selectedCategory) {
      setVerifyError(`Photo shows "${result.action}" (${result.category}), not ${selectedCategory}. The photo must match the action type you selected.`)
      setLogging(null)
      setVerifying(false)
      return
    }

    await executeLog(action, result.points || action.points, selectedCategory)
  }

  const handleAutoLog = async (imgArg?: string | React.MouseEvent) => {
    const targetImage = typeof imgArg === 'string' ? imgArg : pendingImage;
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
      setVerifyError(`Low confidence (${result.confidence}%). Could not reliably identify this action.`)
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
    if (!file) return
    const base64 = await compressImage(file)
    setPendingImage(base64)
    setPhotoError(false)
    setVerifyError(null)
    handleAutoLog(base64)
  }

  return (
    <motion.div
      key="log"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4"
    >
      <AnimatePresence>
        {isAutoLogging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${autoLogSuccess ? 'bg-[#b7ff3c]' : autoLogFailed ? 'bg-red-500' : 'bg-surface'}`}
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-display text-[42px] tracking-widest mb-8 transition-colors duration-700 text-center px-4 ${autoLogSuccess || autoLogFailed ? 'text-[#07110d]' : 'text-[#b7ff3c]'}`}
            >
              {autoLogSuccess ? `+${autoLogPoints} PTS` : 'RIPPL'}
            </motion.h1>
            
            <div className="w-48 h-1 bg-surface-raised rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: autoLogSuccess || autoLogFailed ? '0%' : '100%' }}
                transition={{ repeat: autoLogSuccess || autoLogFailed ? 0 : Infinity, duration: 1.5, ease: "linear" }}
                className={`absolute inset-0 transition-colors duration-700 ${autoLogSuccess || autoLogFailed ? 'bg-[#07110d]' : 'bg-[#b7ff3c]'}`}
              />
            </div>
            
            <p className={`font-mono text-[10px] uppercase tracking-[0.2em] mt-4 transition-colors duration-700 text-center px-4 ${autoLogSuccess || autoLogFailed ? 'text-[#07110d]' : 'text-text-muted'}`}>
              {autoLogSuccess ? autoLogActionName : autoLogFailed ? 'Verification Failed' : 'verifying action...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">LOG ACTION</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">track your daily impact</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map(cat => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shrink-0 transition-all duration-200 ${
                isActive
                  ? `${cat.bg} border-transparent ring-1 ${cat.ring}`
                  : 'bg-surface-raised/40 border-border hover:border-border-active'
              }`}
            >
              <Icon size={13} className={isActive ? cat.color : 'text-text-muted'} />
              <span className={`font-body text-[11px] font-medium ${isActive ? cat.color : 'text-text-muted'}`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className={`mb-4 rounded-xl border overflow-hidden transition-colors ${
        photoError && !pendingImage
          ? 'border-red-400/50 bg-red-400/5'
          : pendingImage
            ? 'border-border'
            : 'border-border'
      }`}>
        {pendingImage ? (
          <div className="relative flex justify-center bg-surface-overlay/20">
            <img src={pendingImage} alt="Verification" className="max-h-80 object-contain" />
            <button
              onClick={() => { setPendingImage(null); setPhotoError(false); setVerifyError(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface/80 flex items-center justify-center"
            >
              <X size={12} className="text-text-primary" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Camera size={28} className={`mb-2 ${photoError ? 'text-red-400' : 'text-text-muted'}`} />
            <p className={`font-body text-[12px] font-medium ${photoError ? 'text-red-400' : 'text-text-primary'}`}>
              Verification photo required
            </p>
            <p className="font-mono text-[9px] text-text-muted mt-1">Take a photo to prove your action</p>
            {photoError && (
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle size={10} className="text-red-400" />
                <span className="font-mono text-[8px] text-red-400">Please attach a photo before logging</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={pendingImage ? handleAutoLog : handleImagePick}
          className={`w-full flex items-center justify-center gap-2 py-2.5 border-t transition-colors ${
            photoError && !pendingImage
              ? 'border-red-400/20 text-red-400 hover:bg-red-400/5'
              : 'border-border text-text-muted hover:bg-surface-raised/40'
          }`}
        >
          <Camera size={13} />
          <span className="font-body text-[11px]">{pendingImage ? 'Auto-log action' : 'Take or upload photo'}</span>
        </button>
      </div>

      {verifyError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 mb-4 p-3 rounded-xl border border-red-400/30 bg-red-400/5"
        >
          <ShieldX size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[11px] font-medium text-red-400">Verification failed</p>
            <p className="font-mono text-[9px] text-text-muted mt-0.5">{verifyError}</p>
          </div>
        </motion.div>
      )}

      {pendingImage && verifying && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4 p-3 rounded-xl border border-dune-400/30 bg-dune-400/5"
        >
          <div className="w-4 h-4 border-2 border-dune-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-[11px] text-dune-400">Verifying photo with AI...</p>
        </motion.div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          {activeCategory.actions.map((action, i) => {
            const isLogged = loggedActions.has(action.id)
            const isJust = justLogged === action.id
            const isLoading = logging === action.id
            const hasPhoto = !!pendingImage
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleLog(action)}
                disabled={isLogged || isLoading || verifying || !hasPhoto}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 text-left ${
                  isLogged
                    ? 'bg-oasis-500/8 border-oasis-500/20'
                    : !hasPhoto || verifying
                      ? 'bg-surface-raised/30 border-border opacity-50 cursor-not-allowed'
                      : 'bg-surface-raised/50 border-border hover:border-border-active hover:bg-surface-overlay/50 active:scale-[0.98]'
                }`}
              >
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${isLogged ? 'bg-oasis-400/20 text-oasis-400' : hasPhoto && !verifying ? 'bg-surface-overlay text-text-muted' : 'bg-surface-overlay text-text-muted/50'}`}>
                  <action.Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-[13px] font-medium ${isLogged ? 'text-oasis-400' : hasPhoto && !verifying ? 'text-text-primary' : 'text-text-muted'}`}>
                    {action.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {action.co2 > 0 && (
                      <span className="font-mono text-[9px] text-text-muted">{action.co2} kg CO₂</span>
                    )}
                    {action.water > 0 && (
                      <span className="font-mono text-[9px] text-text-muted">{action.water}L saved</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono text-[11px] font-medium ${isLogged ? 'text-oasis-400' : hasPhoto && !verifying ? 'text-dune-400' : 'text-text-muted'}`}>
                    +{action.points}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isLogged
                      ? 'bg-oasis-400 scale-100'
                      : isLoading
                        ? 'bg-surface-overlay'
                        : 'bg-surface-overlay border border-border'
                  }`}>
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-3.5 h-3.5 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin"
                        />
                      ) : isLogged ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <Check size={13} className="text-surface" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <Plus size={13} className={hasPhoto && !verifying ? 'text-text-muted' : 'text-text-muted/50'} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {isJust && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-xl border-2 border-oasis-400 pointer-events-none"
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
