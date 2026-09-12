import type { D1Database } from '@cloudflare/workers-types'
import { fail } from './http'

/* A fixed-window counter in D1. Not exact under heavy concurrency, which is
   fine: the point is to bound abuse and spend, not to meter precisely. */
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

  const row = await db
    .prepare('SELECT window_start, count FROM rate_limits WHERE user_id = ?1 AND bucket = ?2')
    .bind(userId, bucket)
    .first<{ window_start: number; count: number }>()

  if (!row || row.window_start !== windowStart) {
    await db
      .prepare(
        `INSERT INTO rate_limits (user_id, bucket, window_start, count) VALUES (?1, ?2, ?3, 1)
         ON CONFLICT(user_id, bucket) DO UPDATE SET window_start = ?3, count = 1`,
      )
      .bind(userId, bucket, windowStart)
      .run()
    return
  }

  if (row.count >= limit) throw fail(429, message)

  await db
    .prepare('UPDATE rate_limits SET count = count + 1 WHERE user_id = ?1 AND bucket = ?2')
    .bind(userId, bucket)
    .run()
}
