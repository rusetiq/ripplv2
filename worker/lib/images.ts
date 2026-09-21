import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import { fail } from './http'
import { LIMITS } from './catalog'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

/* Keys are content-addressed, so the same photo uploaded twice costs one
   object, and access is checked by the authenticated photo endpoint. */
export async function storeImage(bucket: R2Bucket, bytes: ArrayBuffer, contentType: string): Promise<string> {
  if (!ALLOWED.has(contentType)) throw fail(400, 'Photos must be JPEG, PNG or WebP')
  if (bytes.byteLength > LIMITS.maxImageBytes) throw fail(413, 'That photo is too large (5 MB maximum)')
  if (bytes.byteLength === 0) throw fail(400, 'That photo was empty')

  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const key = `${hash.slice(0, 2)}/${hash}.${extension}`

  // head() first so a repeat upload is a metadata read rather than a write.
  if (!(await bucket.head(key))) {
    await bucket.put(key, bytes, { httpMetadata: { contentType, cacheControl: 'private, no-store' } })
  }
  return key
}

/* A data: URL from the old Firestore rows or from a client that has not been
   updated yet. Accepted so the migration and the new client can overlap. */
export function decodeDataUrl(value: string): { bytes: ArrayBuffer; contentType: string } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(value)
  if (!match) return null
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes: bytes.buffer, contentType: match[1] }
}

export const imageUrl = (key: string | null | undefined) => (key ? `/api/photos/${key}` : null)

/* Image keys are content hashes, so two rows -- or two accounts -- can
   legitimately share one object. Only drop it once the last reference goes. */
export async function releaseImage(db: D1Database, bucket: R2Bucket, key: string) {
  const still = await db
    .prepare(
      `SELECT 1 AS hit FROM posts WHERE image_key = ?1
       UNION ALL SELECT 1 FROM user_actions WHERE image_key = ?1
       UNION ALL SELECT 1 FROM users WHERE photo_key = ?1 LIMIT 1`,
    )
    .bind(key)
    .first<{ hit: number }>()
  if (!still) await bucket.delete(key)
}
