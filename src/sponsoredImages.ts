export const SPONSORED_LOCAL_FALLBACKS = [
  '/assets/sustainability-icons-v2/solar-energy.png',
  '/assets/sustainability-icons-v2/earth-leaf.png',
]

export function resolveSponsoredImageUrl(value: string | undefined, fallback: string) {
  const source = value?.trim()
  if (!source) return fallback

  if (source.startsWith('gs://')) {
    const withoutScheme = source.slice(5)
    const slash = withoutScheme.indexOf('/')
    if (slash === -1) return fallback
    const bucket = withoutScheme.slice(0, slash)
    const objectPath = withoutScheme.slice(slash + 1)
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media`
  }

  const driveMatch = source.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`

  if (source.includes('dropbox.com/')) {
    try {
      const url = new URL(source)
      url.searchParams.delete('dl')
      url.searchParams.set('raw', '1')
      return url.toString()
    } catch {
      return fallback
    }
  }

  if (/^https?:\/\//i.test(source) || source.startsWith('/')) return source
  return fallback
}
