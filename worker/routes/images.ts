import { Hono } from 'hono'
import type { App } from '../types'
import { fail } from '../lib/http'

export const images = new Hono<App>()

const MAX_BYTES = 15 * 1024 * 1024

/* Openverse serves its results from arbitrary third-party CDNs, so a browser
   fetch for one would need connect-src to allow the whole web. Proxying here
   instead keeps the page's policy at 'self' and means the share card composites
   a same-origin image, which cannot taint the export canvas.

   The route sits under /api, so only a signed-in user can drive it. */
images.get('/proxy', async c => {
  const raw = c.req.query('url')
  if (!raw) throw fail(400, 'Missing url')

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    throw fail(400, 'That is not a valid URL')
  }

  // Narrow what the Worker can be pointed at: https only, a real public
  // hostname, and no embedded credentials.
  if (target.protocol !== 'https:') throw fail(400, 'Only https sources are allowed')
  if (target.username || target.password) throw fail(400, 'Credentials are not allowed in the URL')
  const host = target.hostname.toLowerCase()
  const blocked =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.internal') ||
    host.endsWith('.local') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.includes(':')
  if (blocked) throw fail(400, 'That host is not allowed')

  const upstream = await fetch(target.toString(), {
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
    headers: { Accept: 'image/*' },
  }).catch(() => null)

  if (!upstream || !upstream.ok) throw fail(502, 'That photo could not be loaded. Try another result.')

  const type = (upstream.headers.get('content-type') ?? '').split(';')[0].trim()
  if (!type.startsWith('image/')) throw fail(400, 'That link is not an image')

  const declared = Number(upstream.headers.get('content-length') ?? 0)
  if (declared > MAX_BYTES) throw fail(413, 'That photo is too large')

  // Buffer rather than stream so an undeclared oversize body is still caught.
  const bytes = await upstream.arrayBuffer()
  if (bytes.byteLength > MAX_BYTES) throw fail(413, 'That photo is too large')

  return new Response(bytes, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': String(bytes.byteLength),
    },
  })
})
