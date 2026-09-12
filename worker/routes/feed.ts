import { Hono } from 'hono'
import type { Context } from 'hono'
import type { App } from '../types'
import { fail, newId, nowSeconds, readJson, requireText } from '../lib/http'
import { LIMITS } from '../lib/catalog'
import { consume } from '../lib/ratelimit'
import { imageUrl, storeImage, releaseImage } from '../lib/images'
import { publicAuthor } from '../lib/users'

export const feed = new Hono<App>()

interface PostRow {
  id: string
  user_id: string
  category: string
  action: string
  impact: string
  points: number
  image_key: string | null
  likes_count: number
  comments_count: number
  created_at: number
  display_name: string
  photo_key: string | null
  photo_url: string
  liked: number
}

const shape = (row: PostRow) => ({
  id: row.id,
  author: publicAuthor({ uid: row.user_id, display_name: row.display_name, photo_key: row.photo_key, photo_url: row.photo_url }),
  category: row.category,
  action: row.action,
  impact: row.impact,
  points: row.points,
  imageUrl: imageUrl(row.image_key),
  likesCount: row.likes_count,
  commentsCount: row.comments_count,
  liked: row.liked === 1,
  createdAt: row.created_at,
})

/* Author name and avatar are joined live rather than stored on the post, so a
   post always shows who actually wrote it. Images are URLs into R2, not bytes,
   which is what makes a 50-post page cheap. */
feed.get('/', async c => {
  const user = c.get('user')
  const cursor = Number(c.req.query('cursor')) || Number.MAX_SAFE_INTEGER
  const limit = Math.min(Number(c.req.query('limit')) || 25, 50)

  const { results } = await c.env.DB.prepare(
    `SELECT p.*, u.display_name, u.photo_key, u.photo_url,
            EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?1) AS liked
     FROM posts p JOIN users u ON u.uid = p.user_id
     WHERE p.created_at < ?2
     ORDER BY p.created_at DESC LIMIT ?3`,
  )
    .bind(user.uid, cursor, limit)
    .all<PostRow>()

  const posts = results.map(shape)
  return c.json({ posts, nextCursor: posts.length === limit ? posts[posts.length - 1].createdAt : null })
})

feed.post('/', async c => {
  const user = c.get('user')
  await consume(c.env.DB, user.uid, 'post', LIMITS.postsPerHour, 3600, 'You are posting too quickly. Try again shortly.')

  const form = await c.req.formData().catch(() => null)
  if (!form) throw fail(400, 'Expected a multipart form')

  const action = requireText(form.get('text'), LIMITS.maxPostLength, 'Post text')

  let key: string | null = null
  const photo = form.get('photo')
  if (photo && photo instanceof File && photo.size > 0) {
    key = await storeImage(c.env.PHOTOS, await photo.arrayBuffer(), photo.type)
  }

  const id = newId()
  await c.env.DB.prepare(
    `INSERT INTO posts (id, user_id, category, action, impact, points, image_key, created_at)
     VALUES (?1, ?2, '', ?3, '', 0, ?4, ?5)`,
  )
    .bind(id, user.uid, action, key, nowSeconds())
    .run()

  return c.json({ id }, 201)
})

async function ownedPost(c: Context<App>, id: string) {
  const user = c.get('user')
  const post = await c.env.DB.prepare('SELECT user_id, image_key FROM posts WHERE id = ?1')
    .bind(id)
    .first<{ user_id: string; image_key: string | null }>()
  if (!post) throw fail(404, 'That post no longer exists')
  if (post.user_id !== user.uid && user.is_admin !== 1) throw fail(403, 'That is not your post')
  return post
}

feed.patch('/:id', async c => {
  const id = c.req.param('id')
  const post = await ownedPost(c, id)
  const body = await readJson<{ text?: string; removeImage?: boolean }>(c)

  // Moderation: an admin (or the author) can strip a photo without deleting
  // the post. The R2 object goes too, once nothing else points at it.
  if (body.removeImage) {
    await c.env.DB.prepare('UPDATE posts SET image_key = NULL WHERE id = ?1').bind(id).run()
    if (post.image_key) await releaseImage(c.env.DB, c.env.PHOTOS, post.image_key)
    return c.json({ ok: true })
  }

  const action = requireText(body.text, LIMITS.maxPostLength, 'Post text')
  await c.env.DB.prepare('UPDATE posts SET action = ?1 WHERE id = ?2').bind(action, id).run()
  return c.json({ ok: true })
})


feed.delete('/:id', async c => {
  const id = c.req.param('id')
  await ownedPost(c, id)
  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?1').bind(id).run()
  return c.json({ ok: true })
})

/* Anyone signed in can like anyone's post. Under the old Firestore rules only
   the post's own author could, and the failure was swallowed client-side. */
feed.post('/:id/like', async c => {
  const user = c.get('user')
  const id = c.req.param('id')

  const exists = await c.env.DB.prepare('SELECT 1 AS hit FROM posts WHERE id = ?1').bind(id).first()
  if (!exists) throw fail(404, 'That post no longer exists')

  const already = await c.env.DB.prepare('SELECT 1 AS hit FROM post_likes WHERE post_id = ?1 AND user_id = ?2')
    .bind(id, user.uid)
    .first()

  if (already) {
    await c.env.DB.batch([
      c.env.DB.prepare('DELETE FROM post_likes WHERE post_id = ?1 AND user_id = ?2').bind(id, user.uid),
      c.env.DB.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?1').bind(id),
    ])
  } else {
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?1, ?2, ?3)').bind(id, user.uid, nowSeconds()),
      c.env.DB.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?1').bind(id),
    ])
  }

  const row = await c.env.DB.prepare('SELECT likes_count FROM posts WHERE id = ?1').bind(id).first<{ likes_count: number }>()
  return c.json({ liked: !already, likesCount: row?.likes_count ?? 0 })
})

feed.get('/:id/comments', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.text, c.created_at, c.user_id, u.display_name, u.photo_key, u.photo_url
     FROM comments c JOIN users u ON u.uid = c.user_id
     WHERE c.post_id = ?1 ORDER BY c.created_at ASC LIMIT 200`,
  )
    .bind(c.req.param('id'))
    .all<{ id: string; text: string; created_at: number; user_id: string; display_name: string; photo_key: string | null; photo_url: string }>()

  return c.json({
    comments: results.map(row => ({
      id: row.id,
      text: row.text,
      createdAt: row.created_at,
      author: publicAuthor({ uid: row.user_id, display_name: row.display_name, photo_key: row.photo_key, photo_url: row.photo_url }),
    })),
  })
})

feed.post('/:id/comments', async c => {
  const user = c.get('user')
  const id = c.req.param('id')
  await consume(c.env.DB, user.uid, 'comment', LIMITS.commentsPerHour, 3600, 'You are commenting too quickly. Try again shortly.')

  const exists = await c.env.DB.prepare('SELECT 1 AS hit FROM posts WHERE id = ?1').bind(id).first()
  if (!exists) throw fail(404, 'That post no longer exists')

  const body = await readJson<{ text?: string }>(c)
  const text = requireText(body.text, LIMITS.maxCommentLength, 'Comment')

  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO comments (id, post_id, user_id, text, created_at) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(newId(), id, user.uid, text, nowSeconds()),
    c.env.DB.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?1').bind(id),
  ])

  return c.json({ ok: true }, 201)
})

/* A user's own posts, for the profile tab. */
feed.get('/mine/list', async c => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, u.display_name, u.photo_key, u.photo_url, 0 AS liked
     FROM posts p JOIN users u ON u.uid = p.user_id
     WHERE p.user_id = ?1 ORDER BY p.created_at DESC LIMIT 20`,
  )
    .bind(user.uid)
    .all<PostRow>()
  return c.json({ posts: results.map(shape) })
})
