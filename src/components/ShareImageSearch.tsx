import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

interface SearchImage {
  id: string
  title: string
  url: string
  thumbnail: string
  foreign_landing_url: string
  license: string
  mature: boolean
}
const cache = new Map<string, { results: SearchImage[]; more: boolean }>()
const topics = ['forest', 'ocean', 'mountains', 'cycling', 'plants']
const secureUrl = (value: unknown): value is string => typeof value === 'string' && value.startsWith('https://')

export function ShareImageSearch({ onChoose, onBusy }: { onChoose: (file: File) => Promise<void>; onBusy: (busy: boolean) => void }) {
  const [query, setQuery] = useState('forest')
  const [searched, setSearched] = useState('')
  const [results, setResults] = useState<SearchImage[]>([])
  const [page, setPage] = useState(1)
  const [more, setMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [choosing, setChoosing] = useState('')
  const [chosen, setChosen] = useState<SearchImage | null>(null)
  const request = useRef<AbortController | null>(null)
  const selection = useRef<AbortController | null>(null)
  useEffect(() => () => { request.current?.abort(); selection.current?.abort() }, [])

  const search = async (term: string, nextPage = 1) => {
    term = term.trim().slice(0, 100)
    if (!term) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setQuery(term)
    setLoading(true)
    setError('')
    if (nextPage === 1) { setResults([]); setMore(false) }
    try {
      const key = `${term.toLowerCase()}:${nextPage}`
      let data = cache.get(key)
      if (!data) {
        const params = new URLSearchParams({ q: term, license: 'cc0,pdm', category: 'photograph', page_size: '12', page: String(nextPage) })
        const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) })
        if (response.status === 429) throw new Error('Image search is busy. Wait a minute and try again.')
        if (!response.ok) throw new Error('Image search is unavailable. Try again shortly or choose a gallery photo.')
        const body = await response.json()
        if (!Array.isArray(body.results)) throw new Error('Image search returned an unexpected response. Please try again.')
        data = {
          results: body.results.filter((image: SearchImage) => image && !image.mature && ['cc0', 'pdm'].includes(image.license) && secureUrl(image.url) && secureUrl(image.thumbnail) && secureUrl(image.foreign_landing_url)),
          more: nextPage < body.page_count,
        }
        if (cache.size >= 40) cache.clear()
        cache.set(key, data)
      }
      if (controller.signal.aborted) return
      setResults(current => nextPage === 1 ? data.results : [...current, ...data.results.filter(image => !current.some(item => item.id === image.id))])
      setSearched(term)
      setPage(nextPage)
      setMore(data.more)
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not search. Please try again.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const choose = async (image: SearchImage) => {
    selection.current?.abort()
    const controller = new AbortController()
    selection.current = controller
    setChoosing(image.id)
    onBusy(true)
    setError('')
    try {
      // Fetched through the Worker: the CDN host is not in connect-src, and a
      // same-origin blob cannot taint the export canvas.
      const blob = await api.proxyImage(image.url, AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]))
      if (!blob.type.startsWith('image/') || blob.size > 15 * 1024 * 1024) throw new Error('This photo cannot be used. Please choose another result.')
      if (controller.signal.aborted) return
      await onChoose(new File([blob], 'background-photo', { type: blob.type }))
      if (!controller.signal.aborted) setChosen(image)
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'This photo could not be loaded. Try another result.')
    } finally {
      if (!controller.signal.aborted) { setChoosing(''); onBusy(false) }
    }
  }

  return <section className="share-image-search" aria-label="image search">
    <form onSubmit={event => { event.preventDefault(); void search(query) }} className="share-search-form">
      <input aria-label="search background photos" placeholder="search nature, oceans, cities…" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} />
      <button type="submit" disabled={loading || !query.trim()}>search</button>
    </form>
    <div className="share-search-topics">{topics.map(topic => <button type="button" key={topic} disabled={loading} onClick={() => void search(topic)}>{topic}</button>)}</div>
    <p className="share-search-source">Photos via <a href="https://openverse.org/" target="_blank" rel="noreferrer">Openverse</a> · CC0 / public domain</p>
    {loading && <p role="status">finding photos…</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && searched && !results.length && !error && <p role="status">No photos found. Try a broader search.</p>}
    <div className="share-search-results">{results.map(image => <button type="button" key={image.id} disabled={!!choosing} aria-label={`use ${image.title || 'photo'} as background`} onClick={() => void choose(image)}>
      <img src={image.thumbnail} alt={image.title || 'background photo'} loading="lazy" onError={() => setResults(current => current.filter(item => item.id !== image.id))} />
      {choosing === image.id && <span>opening…</span>}
    </button>)}</div>
    {more && <button type="button" className="share-search-more" disabled={loading} onClick={() => void search(searched, page + 1)}>more photos</button>}
    {chosen && <p className="share-search-source">Photo: <a href={chosen.foreign_landing_url} target="_blank" rel="noreferrer">{chosen.title || 'view source'}</a></p>}
  </section>
}
