import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './LandingPage'

// This entry point mounts the root; the app has its own refresh boundary.
// eslint-disable-next-line react-refresh/only-export-components
const App = lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div role="status" style={{ padding: 32 }}>Opening Rippl…</div>}>
      {window.location.pathname === '/app' || window.location.pathname.startsWith('/app/') ? <App /> : <LandingPage />}
    </Suspense>
  </StrictMode>,
)
