import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import type { App } from './types'
import { AuthError, verifyIdToken } from './lib/auth'
import { fail } from './lib/http'
import { upsertUser } from './lib/users'
import { me } from './routes/me'
import { actions } from './routes/actions'
import { feed } from './routes/feed'
import { rewards } from './routes/rewards'
import { leaderboard } from './routes/leaderboard'
import { admin } from './routes/admin'
import { images } from './routes/images'

const app = new Hono<App>()

/* The app is same-origin with its API and loads no third-party script, so the
   policy can stay tight. connect-src covers Firebase Auth (identity only) and
   the Openverse search the share card uses. */
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      // Firebase Auth's popup loads the gapi client from apis.google.com.
      scriptSrc: ["'self'", 'https://apis.google.com', 'https://www.gstatic.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: [
        "'self'",
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'https://www.googleapis.com',
        'https://api.openverse.org',
      ],
      frameSrc: ['https://saarthaii.firebaseapp.com', 'https://apis.google.com', 'https://accounts.google.com'],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    crossOriginEmbedderPolicy: false,
  }),
)

// Retire public photo URLs. New clients fetch photos with a bearer token.
app.get('/img/*', c => {
  c.header('Cache-Control', 'no-store')
  return c.json({ error: 'This photo URL is no longer public.' }, 410)
})

/* Every /api route below this point has a verified user. There is no
   unauthenticated data path left in the app. */
app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store')
  const header = c.req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw fail(401, 'Sign in to continue')

  let identity
  try {
    identity = await verifyIdToken(token, c.env.FIREBASE_PROJECT_ID)
  } catch (error) {
    if (error instanceof AuthError) throw fail(401, 'Your session has expired. Please sign in again.')
    throw error
  }

  c.set('identity', identity)
  c.set('user', await upsertUser(c.env.DB, identity))
  await next()
})

app.get('/api/photos/*', async c => {
  const key = c.req.path.slice('/api/photos/'.length)
  if (!/^[0-9a-f]{2}\/[0-9a-f]{64}\.(jpg|png|webp)$/.test(key)) return c.notFound()
  // Members can see feed photos and avatars, plus their own private evidence.
  const visible = await c.env.DB.prepare(`
    SELECT 1 FROM posts WHERE image_key = ?1
    UNION ALL SELECT 1 FROM users WHERE photo_key = ?1
    UNION ALL SELECT 1 FROM user_actions WHERE image_key = ?1 AND user_id = ?2 LIMIT 1
  `).bind(key, c.get('user').uid).first()
  if (!visible) return c.notFound()
  const object = await c.env.PHOTOS.get(key)
  if (!object) return c.notFound()
  return new Response(object.body as unknown as BodyInit, { headers: {
    'Content-Type': object.httpMetadata?.contentType ?? 'image/jpeg',
    'Cache-Control': 'private, no-store',
    'Content-Length': String(object.size),
    'X-Content-Type-Options': 'nosniff',
  } })
})

app.use('/api/*', bodyLimit({ maxSize: 6 * 1024 * 1024, onError: c => c.json({ error: 'Upload too large' }, 413) }))

app.route('/api/me', me)
app.route('/api/actions', actions)
app.route('/api/posts', feed)
app.route('/api/rewards', rewards)
app.route('/api/leaderboard', leaderboard)
app.route('/api/admin', admin)
app.route('/api/images', images)

app.notFound(c => c.json({ error: 'Not found' }, 404))

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    const response = error.getResponse()
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }
  // Never let an internal message reach the client; the log keeps the detail.
  console.error('Unhandled', error)
  return c.json({ error: 'Something went wrong on our end.' }, 500)
})

export default app
