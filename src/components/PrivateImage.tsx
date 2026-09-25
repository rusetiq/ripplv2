import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { api } from '../api'

export function PrivateImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState<{ src: string; url: string } | null>(null)
  const privatePhoto = src?.startsWith('/api/photos/')
  useEffect(() => {
    if (!src?.startsWith('/api/photos/')) return
    const controller = new AbortController()
    let url: string | undefined
    void api.photo(src, controller.signal).then(blob => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob)
      setLoaded({ src, url })
    }).catch(() => {})
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [src])
  return <img {...props} src={privatePhoto ? (loaded && loaded.src === src ? loaded.url : undefined) : src} />
}
