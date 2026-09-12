import { Hono } from 'hono'
import type { App } from '../types'
import { clampText, fail, readJson } from '../lib/http'
import { LIMITS } from '../lib/catalog'
import { loadBadges, loadRedeemed, selfPayload } from '../lib/users'
import { storeImage, releaseImage } from '../lib/images'

export const me = new Hono<App>()

me.get('/', async c => {
  const user = c.get('user')
  const [badges, redeemed] = await Promise.all([
    loadBadges(c.env.DB, user.uid),
    loadRedeemed(c.env.DB, user.uid),
  ])
  return c.json(selfPayload(user, badges, redeemed))
})

/* The only fields a client may ever write about itself. Points, streak,
   totals, badges and admin are absent by construction. */
me.patch('/', async c => {
  const user = c.get('user')
  const body = await readJson<{ displayName?: string; location?: string }>(c)

  const displayName = body.displayName === undefined ? user.display_name : clampText(body.displayName, LIMITS.maxNameLength)
  const location = body.location === undefined ? user.location : clampText(body.location, LIMITS.maxLocationLength)

  await c.env.DB.prepare('UPDATE users SET display_name = ?1, location = ?2 WHERE uid = ?3')
    .bind(displayName, location, user.uid)
    .run()

  const [badges, redeemed] = await Promise.all([
    loadBadges(c.env.DB, user.uid),
    loadRedeemed(c.env.DB, user.uid),
  ])
  return c.json(selfPayload({ ...user, display_name: displayName, location }, badges, redeemed))
})

me.post('/avatar', async c => {
  const user = c.get('user')
  const contentType = c.req.header('content-type') ?? ''
  const bytes = await c.req.arrayBuffer()
  const key = await storeImage(c.env.PHOTOS, bytes, contentType.split(';')[0].trim())

  const previous = user.photo_key
  await c.env.DB.prepare('UPDATE users SET photo_key = ?1 WHERE uid = ?2').bind(key, user.uid).run()
  if (previous && previous !== key) await releaseImage(c.env.DB, c.env.PHOTOS, previous)

  return c.json({ photoURL: `/img/${key}` })
})

/* Everything the account holds, as one JSON file. The privacy policy has
   always promised this; now it exists. */
me.get('/export', async c => {
  const user = c.get('user')
  const db = c.env.DB
  const [actions, posts, comments, badges, redeemed] = await Promise.all([
    db.prepare('SELECT * FROM user_actions WHERE user_id = ?1 ORDER BY created_at').bind(user.uid).all(),
    db.prepare('SELECT * FROM posts WHERE user_id = ?1 ORDER BY created_at').bind(user.uid).all(),
    db.prepare('SELECT * FROM comments WHERE user_id = ?1 ORDER BY created_at').bind(user.uid).all(),
    loadBadges(db, user.uid),
    loadRedeemed(db, user.uid),
  ])

  return c.json(
    {
      exportedAt: new Date().toISOString(),
      profile: { ...user, is_admin: user.is_admin === 1 },
      actions: actions.results,
      posts: posts.results,
      comments: comments.results,
      badges,
      redeemedRewards: redeemed,
    },
    200,
    { 'Content-Disposition': 'attachment; filename="rippl-export.json"' },
  )
})

me.delete('/', async c => {
  const user = c.get('user')
  const body = await readJson<{ confirm?: string }>(c)
  if (body.confirm !== 'DELETE') throw fail(400, 'Send {"confirm":"DELETE"} to delete the account')

  const db = c.env.DB

  // Collect this account's images before the rows go, so orphans can be swept.
  const owned = await db
    .prepare(
      `SELECT image_key AS k FROM posts WHERE user_id = ?1 AND image_key IS NOT NULL
       UNION SELECT image_key FROM user_actions WHERE user_id = ?1 AND image_key IS NOT NULL
       UNION SELECT photo_key FROM users WHERE uid = ?1 AND photo_key IS NOT NULL`,
    )
    .bind(user.uid)
    .all<{ k: string }>()

  // Comment counts on other people's posts have to settle before the cascade.
  await db
    .prepare(
      `UPDATE posts SET comments_count = MAX(0, comments_count -
         (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.user_id = ?1))
       WHERE id IN (SELECT post_id FROM comments WHERE user_id = ?1)`,
    )
    .bind(user.uid)
    .run()
  await db
    .prepare(
      `UPDATE posts SET likes_count = MAX(0, likes_count - 1)
       WHERE id IN (SELECT post_id FROM post_likes WHERE user_id = ?1)`,
    )
    .bind(user.uid)
    .run()

  // Foreign keys cascade the rest: posts, comments, likes, actions, badges,
  // redemptions all hang off users(uid).
  await db.prepare('DELETE FROM users WHERE uid = ?1').bind(user.uid).run()
  await db.prepare('DELETE FROM rate_limits WHERE user_id = ?1').bind(user.uid).run()

  for (const row of owned.results) await releaseImage(db, c.env.PHOTOS, row.k)

  return c.json({ deleted: true })
})

