import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '../App'

export function SignInModal() {
  const { showSignIn, setShowSignIn, signInWithGoogle } = useApp()

  return (
    <AnimatePresence>
      {showSignIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/70 backdrop-blur-md px-4"
          onClick={() => setShowSignIn(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[320px] bg-surface-raised border border-border rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-[15px] font-bold text-text-primary">Sign in</h3>
              <button onClick={() => setShowSignIn(false)} className="text-text-muted hover:text-text-secondary transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="font-mono text-[10px] text-text-muted mb-6">
              Sign in to track your impact, earn points, and unlock rewards across the UAE.
            </p>
            <button
              onClick={() => { signInWithGoogle(); setShowSignIn(false) }}
              className="flex items-center justify-center gap-2.5 w-full bg-surface hover:bg-surface-overlay border border-border rounded-xl px-5 py-2.5 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="font-body text-[13px] text-text-primary">Continue with Google</span>
            </button>
            <p className="font-mono text-[8px] text-text-muted text-center mt-4">
              Your data stays private. We only access your name and email.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
