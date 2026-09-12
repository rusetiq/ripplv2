import type { D1Database } from '@cloudflare/workers-types'
import type { UserRow } from '../types'

/* Recomputed server-side after anything that can move a total. The old client
   version unlocked "metro master" and "solar pioneer" on level alone, which
   contradicted the descriptions shown next to them in the UI; these are the
   rules the descriptions actually promise. */
export async function recomputeBadges(db: D1Database, user: UserRow) {
  const counts = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN lower(label) LIKE '%metro%' THEN 1 ELSE 0 END) AS metro,
         SUM(CASE WHEN lower(label) LIKE '%solar%' THEN 1 ELSE 0 END) AS solar
       FROM user_actions WHERE user_id = ?1`,
    )
    .bind(user.uid)
    .first<{ metro: number | null; solar: number | null }>()

  const metro = counts?.metro ?? 0
  const solar = counts?.solar ?? 0

  const ahead = await db
    .prepare('SELECT COUNT(*) AS n FROM users WHERE points > ?1')
    .bind(user.points)
    .first<{ n: number }>()
  const rank = (ahead?.n ?? 0) + 1

  const pct = (value: number, target: number) => Math.min(99, Math.floor((value / target) * 100))

  const state: Record<string, { unlocked: boolean; progress: number }> = {
    b1: { unlocked: user.points > 0, progress: user.points > 0 ? 100 : 0 },
    b2: { unlocked: metro >= 10, progress: metro >= 10 ? 100 : pct(metro, 10) },
    b3: { unlocked: user.water_saved >= 1000, progress: user.water_saved >= 1000 ? 100 : pct(user.water_saved, 1000) },
    b4: { unlocked: solar >= 5, progress: solar >= 5 ? 100 : pct(solar, 5) },
    b5: { unlocked: user.co2_saved >= 500, progress: user.co2_saved >= 500 ? 100 : pct(user.co2_saved, 500) },
    b6: { unlocked: user.streak >= 30, progress: user.streak >= 30 ? 100 : pct(user.streak, 30) },
    b7: { unlocked: user.co2_saved >= 1000, progress: user.co2_saved >= 1000 ? 100 : pct(user.co2_saved, 1000) },
    b8: { unlocked: rank <= 10 && user.points > 0, progress: rank <= 10 && user.points > 0 ? 100 : 0 },
  }

  // Badges only ever ratchet forward, so a user who slips out of the top ten
  // keeps the badge they earned.
  await db.batch(
    Object.entries(state).map(([id, value]) =>
      db
        .prepare(
          `INSERT INTO badges (user_id, badge_id, unlocked, progress) VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT(user_id, badge_id) DO UPDATE SET
             unlocked = MAX(badges.unlocked, excluded.unlocked),
             progress = MAX(badges.progress, excluded.progress)`,
        )
        .bind(user.uid, id, value.unlocked ? 1 : 0, value.progress),
    ),
  )
}
