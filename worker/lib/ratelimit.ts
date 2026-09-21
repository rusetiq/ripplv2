import type { D1Database } from '@cloudflare/workers-types'
import { fail } from './http'

/* Atomic fixed-window counter: simultaneous requests share the same limit. */
export async function consume(
  db: D1Database,
  userId: string,
  bucket: string,
  limit: number,
  windowSeconds: number,
  message: string,
) {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - (now % windowSeconds)

  const row = await db.prepare(`
    INSERT INTO rate_limits (user_id, bucket, window_start, count) VALUES (?1, ?2, ?3, 1)
    ON CONFLICT(user_id, bucket) DO UPDATE SET
      window_start = excluded.window_start,
      count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END
    WHERE rate_limits.window_start <> excluded.window_start OR rate_limits.count < ?4
    RETURNING count
  `).bind(userId, bucket, windowStart, limit).first<{ count: number }>()
  if (!row) throw fail(429, message)
}
