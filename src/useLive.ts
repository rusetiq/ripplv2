import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './api'

interface Options {
  /* How often to refetch while the tab is visible. Firestore's onSnapshot gave
     instant updates; this trades that for a far cheaper request profile, so
     the interval is gentle rather than aggressive. */
  intervalMs?: number
  enabled?: boolean
}

interface State<T> {
  data: T | null
  error: string | null
  loading: boolean
  refresh: () => void
  /* Lets a mutation write its own result straight into the cache instead of
     waiting for the next poll. */
  set: (updater: (current: T | null) => T | null) => void
}

/* Replaces the onSnapshot listeners: fetches once, then revalidates whenever
   the tab regains focus, when the network comes back, and on a slow timer
   while the page is actually visible. */
export function useLive<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  { intervalMs = 60_000, enabled = true }: Options = {},
): State<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [tick, setTick] = useState(0)

  // Kept in a ref so a caller can pass an inline arrow without restarting the
  // subscription on every render.
  const call = useRef(fetcher)
  useEffect(() => { call.current = fetcher })

  const refresh = useCallback(() => setTick(n => n + 1), [])

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    let live = true

    const load = async () => {
      try {
        const next = await call.current(controller.signal)
        if (!live) return
        setData(next)
        setError(null)
      } catch (caught) {
        if (!live || controller.signal.aborted) return
        // A stale token resolves itself on the next tick; do not alarm the user.
        if (caught instanceof ApiError && caught.status === 401) return
        setError(caught instanceof Error ? caught.message : 'Could not load.')
      } finally {
        if (live) setLoading(false)
      }
    }

    void load()

    const onFocus = () => { if (document.visibilityState === 'visible') void load() }
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load() }, intervalMs)

    window.addEventListener('focus', onFocus)
    window.addEventListener('online', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      live = false
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled, intervalMs])

  const set = useCallback((updater: (current: T | null) => T | null) => setData(updater), [])

  // Derived rather than cleared in an effect, so a signed-out render never
  // shows the previous account's data for a frame.
  return { data: enabled ? data : null, error, loading: enabled ? loading : false, refresh, set }
}
