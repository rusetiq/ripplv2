import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DotLoader } from './components/DotLoader'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import LandingPage from './LandingPage'

// This entry point mounts the root; the app has its own refresh boundary.
// eslint-disable-next-line react-refresh/only-export-components
const App = lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
    <Suspense fallback={<div role="status" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-surface text-text-muted"><DotLoader size={44} className="text-oasis-400" /><span className="font-mono text-[10px]">Opening Rippl…</span></div>}>
      {window.location.pathname === '/app' || window.location.pathname.startsWith('/app/') ? <App /> : <LandingPage />}
    </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
)
