import { Hono } from 'hono'
import type { App } from '../types'
import { imageUrl } from '../lib/images'

export const leaderboard = new Hono<App>()

/* Name, avatar and points only. The old client streamed whole user documents,
   emails included, to render exactly these three fields. */
leaderboard.get('/', async c => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(
    `SELECT uid, display_name, photo_key, photo_url, points
     FROM users WHERE points > 0 ORDER BY points DESC, uid ASC LIMIT 50`,
  ).all<{ uid: string; display_name: string; photo_key: string | null; photo_url: string; points: number }>()

  const players = results.map((row, index) => ({
    rank: index + 1,
    uid: row.uid,
    name: row.display_name || 'Anonymous',
    photoURL: imageUrl(row.photo_key) ?? row.photo_url,
    points: row.points,
    isUser: row.uid === user.uid,
  }))

  // Someone outside the top 50 still gets to see where they stand.
  let self = players.find(p => p.isUser) ?? null
  if (!self) {
    const ahead = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM users WHERE points > ?1').bind(user.points).first<{ n: number }>()
    self = {
      rank: (ahead?.n ?? 0) + 1,
      uid: user.uid,
      name: user.display_name || 'Anonymous',
      photoURL: imageUrl(user.photo_key) ?? user.photo_url,
      points: user.points,
      isUser: true,
    }
  }

  return c.json({ players, self })
})
