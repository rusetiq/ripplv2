import { Hono } from 'hono'
import type { App } from '../types'
import { fail } from '../lib/http'
import { consume } from '../lib/ratelimit'

export const MAX_PROXY_BYTES = 15 * 1024 * 1024

// Restrict destinations to image providers used by the background picker.
// Every redirect is checked again before any request is made.
export function imageTarget(raw: string): URL {
  let target: URL
  try { target = new URL(raw) } catch { throw fail(400, 'Invalid image URL') }
  const host = target.hostname
  const allowed = host === 'images.unsplash.com' || host === 'upload.wikimedia.org' ||
    host === 'images.pexels.com' || host === 'live.staticflickr.com' ||
    /^farm[0-9]+\.staticflickr\.com$/.test(host)
  if (target.protocol !== 'https:' || target.username || target.password || target.port || !allowed) {
    throw fail(400, 'This image provider is not supported. Choose another photo.')
  }
  return target
}

export async function limitedImage(response: Response): Promise<ArrayBuffer> {
  const type = (response.headers.get('content-type') ?? '').split(';')[0].trim()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    await response.body?.cancel()
    throw fail(400, 'Choose a JPEG, PNG or WebP photo')
  }
  if (Number(response.headers.get('content-length')) > MAX_PROXY_BYTES) {
    await response.body?.cancel()
    throw fail(413, 'That photo is too large')
  }
  const reader = response.body?.getReader()
  if (!reader) throw fail(502, 'That photo was empty')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_PROXY_BYTES) {
        await reader.cancel()
        throw fail(413, 'That photo is too large')
      }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes.buffer
}

export async function fetchImage(raw: string): Promise<Response> {
  let target = imageTarget(raw)
  const signal = AbortSignal.timeout(20_000)
  for (let hop = 0; hop <= 3; hop++) {
    const response = await fetch(target, { redirect: 'manual', signal, headers: { Accept: 'image/jpeg,image/png,image/webp' } })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location || hop === 3) throw fail(502, 'Too many image redirects')
      target = imageTarget(new URL(location, target).href)
      continue
    }
    if (!response.ok) { await response.body?.cancel(); throw fail(502, 'That photo could not be loaded') }
    const bytes = await limitedImage(response)
    return new Response(bytes, { headers: {
      'Content-Type': response.headers.get('content-type')!,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } })
  }
  throw fail(502, 'That photo could not be loaded')
}

export const images = new Hono<App>()
images.get('/proxy', async c => {
  const raw = c.req.query('url')
  if (!raw) throw fail(400, 'Missing url')
  imageTarget(raw)
  await consume(c.env.DB, c.get('user').uid, 'image-proxy', 60, 3600, 'Too many photo requests. Try again later.')
  return fetchImage(raw)
})
