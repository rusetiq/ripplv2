import type { D1Database } from '@cloudflare/workers-types'
import type { Identity } from './auth'
import type { UserRow } from '../types'
import { dayKey, nowSeconds } from './http'
import { imageUrl } from './images'
import { levelFor } from './catalog'

/* First call after a Google sign-in creates the row. Name and avatar are
   refreshed from the token each time so a Google profile change follows
   through, but points and streak are never touched here. */
export async function upsertUser(db: D1Database, identity: Identity): Promise<UserRow> {
  await db
    .prepare(
      `INSERT INTO users (uid, email, display_name, photo_url, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(uid) DO UPDATE SET
         email = excluded.email,
         display_name = CASE WHEN users.display_name = '' THEN excluded.display_name ELSE users.display_name END,
         photo_url = excluded.photo_url`,
    )
    .bind(identity.uid, identity.email, identity.name, identity.picture, nowSeconds())
    .run()

  return (await db.prepare('SELECT * FROM users WHERE uid = ?1').bind(identity.uid).first<UserRow>())!
}

/* The owner's own view: the only place email is ever returned. */
export function selfPayload(user: UserRow, badges: Record<string, { unlocked: boolean; progress: number }>, redeemed: string[]) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.display_name,
    location: user.location,
    photoURL: imageUrl(user.photo_key) ?? user.photo_url,
    points: user.points,
    co2Saved: user.co2_saved,
    waterSaved: user.water_saved,
    streak: user.streak,
    level: levelFor(user.points),
    lastActiveDate: user.last_active_date,
    isAdmin: user.is_admin === 1,
    badges,
    redeemedRewards: redeemed,
  }
}

/* What anyone else is allowed to see about a user. No email, no location. */
export const publicAuthor = (row: { uid: string; display_name: string; photo_key: string | null; photo_url: string }) => ({
  uid: row.uid,
  displayName: row.display_name || 'Anonymous',
  photoURL: imageUrl(row.photo_key) ?? row.photo_url,
})

export async function loadBadges(db: D1Database, uid: string) {
  const { results } = await db
    .prepare('SELECT badge_id, unlocked, progress FROM badges WHERE user_id = ?1')
    .bind(uid)
    .all<{ badge_id: string; unlocked: number; progress: number }>()
  const badges: Record<string, { unlocked: boolean; progress: number }> = {}
  for (const row of results) badges[row.badge_id] = { unlocked: row.unlocked === 1, progress: row.progress }
  return badges
}

export async function loadRedeemed(db: D1Database, uid: string) {
  const { results } = await db
    .prepare('SELECT reward_id FROM redemptions WHERE user_id = ?1')
    .bind(uid)
    .all<{ reward_id: string }>()
  return results.map(r => r.reward_id)
}

/* Streak advances at most once per UTC day, on the day an action is logged. */
export function streakUpdate(user: UserRow): { streak: number; lastActiveDate: string } {
  const today = dayKey()
  if (user.last_active_date === today) return { streak: user.streak, lastActiveDate: today }

  const yesterday = dayKey(Date.now() - 86_400_000)
  const streak = user.last_active_date === yesterday ? user.streak + 1 : 1
  return { streak, lastActiveDate: today }
}
