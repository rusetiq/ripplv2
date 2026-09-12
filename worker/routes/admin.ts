import { Hono } from 'hono'
import type { App } from '../types'
import { clampText, fail, newId, nowSeconds, readJson, requireText } from '../lib/http'

export const admin = new Hono<App>()

/* One source of truth for admin: the users.is_admin column, checked here on
   every request. The old build had three (a custom claim the rules wanted, a
   claim the app read, and a document field the UI read) and none were set. */
admin.use('*', async (c, next) => {
  if (c.get('user').is_admin !== 1) throw fail(403, 'Administrator access required')
  await next()
})

admin.get('/admins', async c => {
  const { results } = await c.env.DB.prepare(
    'SELECT uid, display_name, email FROM users WHERE is_admin = 1 ORDER BY display_name',
  ).all<{ uid: string; display_name: string; email: string }>()
  return c.json({ admins: results.map(r => ({ uid: r.uid, displayName: r.display_name, email: r.email })) })
})

admin.post('/admins', async c => {
  const body = await readJson<{ email?: string }>(c)
  const email = requireText(body.email, 200, 'Email').toLowerCase()

  const target = await c.env.DB.prepare('SELECT uid FROM users WHERE email = ?1').bind(email).first<{ uid: string }>()
  if (!target) throw fail(404, 'No user with that email has signed in yet')

  await c.env.DB.prepare('UPDATE users SET is_admin = 1 WHERE uid = ?1').bind(target.uid).run()
  return c.json({ ok: true })
})

admin.delete('/admins/:uid', async c => {
  const uid = c.req.param('uid')
  if (uid === c.get('user').uid) throw fail(400, 'You cannot remove your own admin access')

  const remaining = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM users WHERE is_admin = 1').first<{ n: number }>()
  if ((remaining?.n ?? 0) <= 1) throw fail(400, 'That is the last administrator')

  await c.env.DB.prepare('UPDATE users SET is_admin = 0 WHERE uid = ?1').bind(uid).run()
  return c.json({ ok: true })
})

admin.post('/sponsored', async c => {
  const body = await readJson<{ name?: string; subtitle?: string; href?: string; imageUrl?: string; points?: number; badge?: string }>(c)

  const name = requireText(body.name, 80, 'Partner name')
  const href = safeUrl(requireText(body.href, 500, 'Target URL'))
  const image = safeUrl(requireText(body.imageUrl, 500, 'Banner image URL'))

  const order = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM sponsored_rewards').first<{ n: number }>()

  await c.env.DB.prepare(
    `INSERT INTO sponsored_rewards (id, name, subtitle, href, image_url, points, badge, sort_order, created_at)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`,
  )
    .bind(newId(), name, clampText(body.subtitle, 160), href, image, Math.max(0, Math.min(10_000, Number(body.points) || 0)), clampText(body.badge, 40), order?.n ?? 0, nowSeconds())
    .run()

  return c.json({ ok: true }, 201)
})

admin.delete('/sponsored/:id', async c => {
  await c.env.DB.prepare('DELETE FROM sponsored_rewards WHERE id = ?1').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

/* Admin-supplied URLs end up in an href and an img src, so the scheme is
   pinned to https rather than trusted. */
function safeUrl(value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw fail(400, 'That URL is not valid')
  }
  if (url.protocol !== 'https:') throw fail(400, 'URLs must start with https://')
  return url.toString()
}
