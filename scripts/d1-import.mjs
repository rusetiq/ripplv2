#!/usr/bin/env node
/* Step 2: turn the Firestore dump into D1 rows and R2 objects.
 *
 *   node scripts/d1-import.mjs --local     # into the local dev database
 *   node scripts/d1-import.mjs --remote    # into production
 *
 * Photos in the old data are base64 data URLs inside the documents. They are
 * decoded here and keyed by the same content hash the Worker uses, so the
 * rows and the objects line up.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const remote = process.argv.includes('--remote')
const local = process.argv.includes('--local')
if (remote === local) {
  console.error('Pass exactly one of --local or --remote')
  process.exit(1)
}

const data = JSON.parse(readFileSync('scripts/firestore-dump.json', 'utf8'))
const OUT = 'scripts/.import'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(`${OUT}/objects`, { recursive: true })

const q = v => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
const n = v => (Number.isFinite(Number(v)) ? Number(v) : 0)
const seconds = ts => (ts?._seconds ?? ts?.seconds ?? Math.floor(Date.now() / 1000))

/* Decode a data URL, write it out for upload, and return the key the Worker
   would have given it. */
const images = new Map()
function imageKey(value) {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) return null
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(value)
  if (!match) return null
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length) return null
  const hash = createHash('sha256').update(bytes).digest('hex')
  const ext = match[1] === 'image/png' ? 'png' : match[1] === 'image/webp' ? 'webp' : 'jpg'
  const key = `${hash.slice(0, 2)}/${hash}.${ext}`
  if (!images.has(key)) {
    const file = `${OUT}/objects/${hash}.${ext}`
    writeFileSync(file, bytes)
    images.set(key, { file, contentType: match[1] })
  }
  return key
}

const sql = ['PRAGMA defer_foreign_keys = true;']
const knownUsers = new Set()

for (const u of data.users) {
  knownUsers.add(u.id)
  sql.push(
    `INSERT INTO users (uid, email, display_name, location, photo_key, photo_url, points, co2_saved, water_saved, streak, last_active_date, is_admin, created_at) VALUES (` +
      [
        q(u.id),
        q(String(u.email ?? '').toLowerCase()),
        q(u.displayName ?? ''),
        q(u.location ?? ''),
        q(imageKey(u.photoURL)),
        q(typeof u.photoURL === 'string' && !u.photoURL.startsWith('data:') ? u.photoURL : ''),
        n(u.points),
        n(u.co2Saved),
        n(u.waterSaved),
        n(u.streak),
        q(u.lastActiveDate ?? ''),
        u.isAdmin ? 1 : 0,
        Math.floor(Date.now() / 1000),
      ].join(', ') +
      `) ON CONFLICT(uid) DO NOTHING;`,
  )

  for (const [id, badge] of Object.entries(u.badges ?? {})) {
    sql.push(
      `INSERT INTO badges (user_id, badge_id, unlocked, progress) VALUES (${q(u.id)}, ${q(id)}, ${badge?.unlocked ? 1 : 0}, ${n(badge?.progress)}) ON CONFLICT DO NOTHING;`,
    )
  }
  for (const rewardId of u.redeemedRewards ?? []) {
    sql.push(
      `INSERT INTO redemptions (user_id, reward_id, cost, created_at) VALUES (${q(u.id)}, ${q(rewardId)}, 0, ${Math.floor(Date.now() / 1000)}) ON CONFLICT DO NOTHING;`,
    )
  }
}

let orphanPosts = 0
for (const p of data.posts) {
  if (!knownUsers.has(p.userId)) { orphanPosts++; continue }
  sql.push(
    `INSERT INTO posts (id, user_id, category, action, impact, points, image_key, likes_count, comments_count, created_at) VALUES (` +
      [q(p.id), q(p.userId), q(p.category ?? ''), q(p.action ?? ''), q(p.impact ?? ''), n(p.points), q(imageKey(p.imageBase64)), n(p.likesCount), n(p.commentsCount), seconds(p.timestamp)].join(', ') +
      `) ON CONFLICT(id) DO NOTHING;`,
  )
  // Likes were a map on the document; they become rows.
  for (const [uid, on] of Object.entries(p.likes ?? {})) {
    if (on && knownUsers.has(uid)) {
      sql.push(`INSERT INTO post_likes (post_id, user_id, created_at) VALUES (${q(p.id)}, ${q(uid)}, ${seconds(p.timestamp)}) ON CONFLICT DO NOTHING;`)
    }
  }
}

let orphanComments = 0
for (const c of data.comments) {
  if (!knownUsers.has(c.userId)) { orphanComments++; continue }
  sql.push(
    `INSERT INTO comments (id, post_id, user_id, text, created_at) VALUES (${q(c.id)}, ${q(c.postId)}, ${q(c.userId)}, ${q(c.text ?? '')}, ${seconds(c.timestamp)}) ON CONFLICT(id) DO NOTHING;`,
  )
}

let orphanActions = 0
for (const a of data.userActions) {
  if (!knownUsers.has(a.userId)) { orphanActions++; continue }
  sql.push(
    `INSERT INTO user_actions (id, user_id, action_id, category, label, points, co2, water, image_key, created_at) VALUES (` +
      [q(a.id), q(a.userId), q(a.actionId ?? 'auto'), q(a.category ?? ''), q(a.label ?? ''), n(a.points), n(a.co2), n(a.water), q(imageKey(a.imageBase64)), seconds(a.timestamp)].join(', ') +
      `) ON CONFLICT(id) DO NOTHING;`,
  )
}

data.sponsoredRewards.forEach((s, i) => {
  sql.push(
    `INSERT INTO sponsored_rewards (id, name, subtitle, href, image_url, points, badge, sort_order, created_at) VALUES (` +
      [q(s.id), q(s.name ?? ''), q(s.subtitle ?? ''), q(s.href ?? ''), q(s.imageUrl ?? ''), n(s.points), q(s.badge ?? ''), n(s.order ?? i), Math.floor(Date.now() / 1000)].join(', ') +
      `) ON CONFLICT(id) DO NOTHING;`,
  )
})

// Counters are recomputed from the rows rather than trusted from the old data.
sql.push(
  `UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id),
                    comments_count = (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id);`,
)

const file = `${OUT}/import.sql`
writeFileSync(file, sql.join('\n'))

console.log(`Prepared ${sql.length - 1} statements and ${images.size} images.`)
if (orphanPosts || orphanComments || orphanActions) {
  console.log(`Skipped rows with no matching user: ${orphanPosts} posts, ${orphanComments} comments, ${orphanActions} actions.`)
}

const target = remote ? '--remote' : '--local'
const run = (args) => execFileSync('npx', ['wrangler', ...args], { stdio: 'inherit' })

console.log(`\nUploading ${images.size} images to R2...`)
let done = 0
for (const [key, { file: path, contentType }] of images) {
  run(['r2', 'object', 'put', `rippl-photos/${key}`, '--file', path, '--content-type', contentType, ...(remote ? ['--remote'] : ['--local'])])
  if (++done % 25 === 0) console.log(`  ${done}/${images.size}`)
}

console.log(`\nApplying SQL to D1 (${target})...`)
run(['d1', 'execute', 'rippl', target, '--file', file, '--yes'])

console.log('\nDone. Spot-check with:')
console.log(`  npx wrangler d1 execute rippl ${target} --command "SELECT COUNT(*) FROM users"`)
