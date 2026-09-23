# Rippl on Cloudflare — setup and migration

Firebase is now **identity only**: the Google sign-in popup still runs in the browser, and the Worker verifies the resulting ID token against Google's public keys on every request. Firestore, Firebase Hosting and the client-side Gemini call are gone.

| Was | Now |
|---|---|
| Firestore (client writes, security rules) | D1 behind the Worker API — no client writes at all |
| Base64 photos inside documents | R2 objects, content-addressed, served from `/img/<key>` |
| Gemini called from the browser with a shipped key | `POST /api/actions/verify` on the Worker, key held as a secret |
| Firebase Hosting | Workers static assets (`dist/`), same origin as the API. The old Hosting site now only 301s to the new one. |
| 6 × `onSnapshot` listeners | `useLive` — fetch, revalidate on focus/online/visibility + slow timer |
| `isAdmin` doc field + unset custom claim + UI flag | one `users.is_admin` column, checked server-side |

## Status as of 2026-09-11

All of this is **done and live** at `https://rippl.aarush-uae.workers.dev`:

- D1 `rippl` (`53a4955c-f050-4041-ba03-ab96be5fec9b`) and R2 `rippl-photos` created, schema applied
- Firestore data imported: 18 users, 9 posts, 22 actions, 1 comment, 5 likes, 10 photos — counts verified against the source
- `aarush.uae@gmail.com` carried across with `is_admin = 1`
- Workers domain authorised in Firebase Auth; `GEMINI_API_KEY` set as a Worker secret
- Firebase Hosting replaced with redirect-only (§6)

**Open:** the Gemini key was previously exposed in a client bundle and has not been rotated. Anyone who obtained the old key may still have access until it is rotated.
**Updated 2026-09-21:** the service-account key created during the September 11 migration has been disabled and its disabled status verified. An older March key remains unchanged because its use is not established.

Sections 1–5 below are kept as the from-scratch runbook.

---

## 1. One-time setup

```bash
npm install
npx wrangler login
```

**Create the database** and paste the id it prints into `wrangler.jsonc` (replace `PLACEHOLDER_RUN_WRANGLER_D1_CREATE`):

```bash
npx wrangler d1 create rippl
```

**Create the bucket:**

```bash
npx wrangler r2 bucket create rippl-photos
```

**Set the Gemini key** (rotate first if the old one was ever shipped to a client):

```bash
npx wrangler secret put GEMINI_API_KEY     # production
# local dev reads .dev.vars, which already has the old key in it — replace it
```

**Add your Workers domain to Firebase Auth** → Authentication → Settings → Authorised domains. Without this the Google popup refuses to run on the new origin.

---

## 2. Schema

```bash
npm run db:migrate:local     # local dev database
npm run db:migrate           # production
```

---

## 3. Move the real data across

There is live data in the `saarthaii` Firestore project, so this is not a fresh start.

```bash
npm i -D firebase-admin
```

Get a service account key: Firebase console → Project settings → Service accounts → **Generate new private key**. It is a real credential — keep it out of git and delete it when you're done.

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run import:firestore
# writes scripts/firestore-dump.json

node scripts/d1-import.mjs --local      # rehearse against local first
node scripts/d1-import.mjs --remote     # then production
```

The importer decodes every base64 photo, hashes it the same way the Worker does, uploads it to R2, and points the row at the resulting key. Likes stored as a map on the post become rows in `post_likes`. Like and comment counts are recomputed from the rows rather than trusted from the old data. Rows whose author no longer exists are skipped and counted in the output.

Spot-check afterwards:

```bash
npx wrangler d1 execute rippl --remote --command "SELECT COUNT(*) FROM users"
npx wrangler d1 execute rippl --remote --command "SELECT COUNT(*) FROM posts WHERE image_key IS NOT NULL"
```

---

## 4. Make yourself an admin

There is no bootstrap-from-the-UI path by design. If the import carried an admin across you are already done; otherwise sign in once so your row exists, then:

```bash
npx wrangler d1 execute rippl --remote \
  --command "UPDATE users SET is_admin = 1 WHERE email = 'aarush.uae@gmail.com'"
```

After that the admin panel can grant and revoke admin normally. The Worker refuses to remove the last remaining administrator.

---

## 5. Run and deploy

```bash
npm run dev        # wrangler dev — Worker + D1 + R2 + static assets on :8787
npm run deploy     # tsc && vite build && wrangler deploy
```

`npm run dev` serves the built `dist/`, so run `npm run build` after a client change (or keep `npx vite build --watch` in a second terminal). `npm run dev:client` still gives you plain Vite HMR, but API calls will 404 there.

---

## 6. The old stack

**Hosting — done.** `saarthaii.web.app` and `saarthaii.firebaseapp.com` now serve nothing but 301s to
`rippl.aarush-uae.workers.dev/app`. The app bundle (and the Gemini key inside it) is gone from Hosting.
`firebase.json` holds only the redirect config now, and `hosting-redirect/` is the one-page fallback.

Deep links are preserved: `/app/terms` → `/app/terms`, `/app/privacy` → `/app/privacy`, everything else → `/app`.

**Do not delete the Hosting site.** Firebase Auth serves its popup handler from
`saarthaii.firebaseapp.com/__/auth/handler`, which is the `authDomain` the client uses. Those reserved
`/__/auth/*` paths take precedence over the redirect rules (verified: they return 200), so sign-in keeps
working — but disabling Hosting entirely would break it.

**Updated 2026-09-21:** Firestore now has deny-all client rules deployed from `firestore.rules`. Legacy data is retained; Authentication stays enabled for the live app.

---

## API surface

Every route below `/api` requires a verified Firebase ID token (`Authorization: Bearer <token>`).

| Method | Path | Notes |
|---|---|---|
| GET | `/api/me` | own profile; the only place `email` is returned |
| PATCH | `/api/me` | `displayName`, `location` only |
| POST | `/api/me/avatar` | raw image body → R2 |
| GET | `/api/me/export` | full data export as JSON |
| DELETE | `/api/me` | permanent account deletion, cascades + sweeps R2 |
| POST | `/api/actions/verify` | photo → model → catalogue points; `?actionId=` to pin an action |
| GET | `/api/actions/week` | 7-day points aggregate |
| GET | `/api/posts` | feed page, author joined, images as URLs |
| POST | `/api/posts` | multipart `text` + optional `photo` |
| PATCH/DELETE | `/api/posts/:id` | author or admin; PATCH takes `text` or `removeImage` |
| POST | `/api/posts/:id/like` | toggle; **any** signed-in user |
| GET/POST | `/api/posts/:id/comments` | |
| GET | `/api/leaderboard` | name, avatar, points — no emails |
| GET | `/api/rewards/sponsored` | |
| POST | `/api/rewards/:id/redeem` | cost, level and balance enforced server-side |
| GET/POST/DELETE | `/api/admin/*` | gated on `users.is_admin` |
| GET | `/api/photos/<key>` | authenticated R2 photo access, private no-store responses |

## Limits

Set in `worker/lib/catalog.ts`, enforced by a fixed-window counter in D1:

- 40 photo verifications per day, 25 logged actions per day
- 20 posts and 60 comments per hour
- 5 MB per photo, JPEG/PNG/WebP only
