import { Hono } from 'hono'
import type { App } from '../types'
import { fail, nowSeconds } from '../lib/http'
import { REWARDS_BY_ID, levelFor } from '../lib/catalog'
import { loadBadges, loadRedeemed, selfPayload } from '../lib/users'

export const rewards = new Hono<App>()

rewards.get('/sponsored', async c => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, subtitle, href, image_url, points, badge FROM sponsored_rewards ORDER BY sort_order ASC',
  ).all<{ id: string; name: string; subtitle: string; href: string; image_url: string; points: number; badge: string }>()

  return c.json({
    sponsored: results.map(r => ({
      id: r.id,
      name: r.name,
      subtitle: r.subtitle,
      href: r.href,
      imageUrl: r.image_url,
      points: r.points,
      badge: r.badge,
    })),
  })
})

/* Cost, level gate, balance and the already-redeemed check are all enforced
   here. The old client subtracted its own points and could simply skip it. */
rewards.post('/:id/redeem', async c => {
  const user = c.get('user')
  const reward = REWARDS_BY_ID.get(c.req.param('id'))
  if (!reward) throw fail(404, 'No such reward')

  if (levelFor(user.points) < reward.level) throw fail(403, `That reward unlocks at level ${reward.level}`)
  if (user.points < reward.cost) throw fail(403, `You need ${reward.cost - user.points} more points`)

  const already = await c.env.DB.prepare('SELECT 1 AS hit FROM redemptions WHERE user_id = ?1 AND reward_id = ?2')
    .bind(user.uid, reward.id)
    .first()
  if (already) throw fail(409, 'You have already redeemed that reward')

  /* The insert is the lock: a second concurrent redemption of the same reward
     hits the primary key and rolls the whole batch back, so points can only
     ever be spent once. */
  try {
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO redemptions (user_id, reward_id, cost, created_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(user.uid, reward.id, reward.cost, nowSeconds()),
      c.env.DB.prepare('UPDATE users SET points = points - ?1 WHERE uid = ?2 AND points >= ?1')
        .bind(reward.cost, user.uid),
    ])
  } catch {
    throw fail(409, 'You have already redeemed that reward')
  }

  const fresh = (await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?1').bind(user.uid).first<typeof user>())!
  const [badges, redeemed] = await Promise.all([loadBadges(c.env.DB, user.uid), loadRedeemed(c.env.DB, user.uid)])
  return c.json({ ok: true, me: selfPayload(fresh, badges, redeemed) })
})
