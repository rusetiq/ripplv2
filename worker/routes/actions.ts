import { Hono } from 'hono'
import type { App } from '../types'
import { dayKey, fail, newId, nowSeconds } from '../lib/http'
import { ACTIONS_BY_ID, LIMITS } from '../lib/catalog'
import { consume } from '../lib/ratelimit'
import { storeImage } from '../lib/images'
import { verifyPhoto } from '../lib/gemini'
import { recomputeBadges } from '../lib/badges'
import { loadBadges, loadRedeemed, selfPayload, streakUpdate } from '../lib/users'

export const actions = new Hono<App>()

const MIN_CONFIDENCE = 60

/* One call does the whole log: store the photo, ask the model what it is,
   award the catalogue's points, write the action and the feed post, move the
   streak, and recompute badges. The client sends a photo and gets a result;
   it never names a score. */
actions.post('/verify', async c => {
  const user = c.get('user')
  const db = c.env.DB

  await consume(db, user.uid, 'verify', LIMITS.verifyPerDay, 86_400, 'Daily verification limit reached. Try again tomorrow.')

  const requested = c.req.query('actionId')
  const target = requested ? ACTIONS_BY_ID.get(requested) : undefined
  if (requested && !target) throw fail(400, 'No such action')

  const contentType = (c.req.header('content-type') ?? '').split(';')[0].trim()
  const bytes = await c.req.arrayBuffer()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw fail(400, 'Photos must be JPEG, PNG or WebP')
  if (!bytes.byteLength || bytes.byteLength > LIMITS.maxImageBytes) throw fail(413, 'Photo must be between 1 byte and 5 MB')
  const verdict = await verifyPhoto(c.env, bytes, contentType)

  // A category match is not evidence for a different, more valuable action.
  if (target && verdict.actionId !== target.id) {
    return c.json({ accepted: false, confidence: verdict.confidence,
      reason: 'The photo does not verify the selected action. Try clearer evidence or automatic detection.' })
  }

  if (verdict.confidence < MIN_CONFIDENCE) {
    return c.json(
      {
        accepted: false,
        confidence: verdict.confidence,
        reason: verdict.reason || 'Could not reliably recognise a sustainability action.',
      },
      200,
    )
  }

  await consume(db, user.uid, 'log', LIMITS.logsPerDay, 86_400, 'Daily action limit reached. Try again tomorrow.')

  const key = await storeImage(c.env.PHOTOS, bytes, contentType)
  const { streak, lastActiveDate } = streakUpdate(user)
  const at = nowSeconds()
  const impact = verdict.water > 0 ? `${verdict.water}L saved` : `${verdict.co2} kg CO₂`

  await db.batch([
    db
      .prepare(
        `INSERT INTO user_actions (id, user_id, action_id, category, label, points, co2, water, image_key, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`,
      )
      .bind(newId(), user.uid, verdict.actionId ?? 'auto', verdict.category, verdict.label, verdict.points, verdict.co2, verdict.water, key, at),
    db
      .prepare(
        `INSERT INTO posts (id, user_id, category, action, impact, points, image_key, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`,
      )
      .bind(newId(), user.uid, verdict.category, verdict.label, impact, verdict.points, key, at),
    db
      .prepare(
        `UPDATE users SET points = points + ?1, co2_saved = co2_saved + ?2, water_saved = water_saved + ?3,
                          streak = ?4, last_active_date = ?5
         WHERE uid = ?6`,
      )
      .bind(verdict.points, verdict.co2, verdict.water, streak, lastActiveDate, user.uid),
  ])

  const fresh = (await db.prepare('SELECT * FROM users WHERE uid = ?1').bind(user.uid).first<typeof user>())!
  await recomputeBadges(db, fresh)

  const [badges, redeemed] = await Promise.all([loadBadges(db, user.uid), loadRedeemed(db, user.uid)])

  return c.json({
    accepted: true,
    confidence: verdict.confidence,
    reason: verdict.reason,
    label: verdict.label,
    category: verdict.category,
    points: verdict.points,
    me: selfPayload(fresh, badges, redeemed),
  })
})

/* Seven UTC days of points for the impact chart. */
actions.get('/week', async c => {
  const user = c.get('user')
  const since = Math.floor(Date.now() / 1000) - 6 * 86_400
  const startOfDay = since - (since % 86_400)

  const { results } = await c.env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', created_at, 'unixepoch') AS day, SUM(points) AS total
     FROM user_actions WHERE user_id = ?1 AND created_at >= ?2 GROUP BY day`,
  )
    .bind(user.uid, startOfDay)
    .all<{ day: string; total: number }>()

  const byDay = new Map(results.map(r => [r.day, r.total]))
  const days: { day: string; points: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const day = dayKey(Date.now() - i * 86_400_000)
    days.push({ day, points: byDay.get(day) ?? 0 })
  }
  return c.json({ days })
})
