# security fixes — 2026-09-21

The review below is historical. Current changes:

- selected actions must exactly match the model-identified catalogue action; client selection cannot increase the award
- all app and tab state remounts when the signed-in account changes, including sign-out
- photos use authenticated `/api/photos/` requests with reference visibility checks and `private, no-store`; old `/img/` URLs return 410
- the image proxy permits only supported image CDN hosts, validates every redirect, caps redirects, rejects SVG, and cancels streams over 15 MB
- API uploads are bounded, rejected verifications no longer persist photos, and rate limits update atomically
- legacy Firestore client access is denied by the deployed `firestore.rules`
- the September 11 migration-date service-account key is disabled; R2 public access through r2.dev is disabled
- dependency audit is clean and regression tests cover the changed security boundaries

The Gemini key is unchanged at the owner's request. Previously downloaded or browser-cached copies of photos cannot be recalled. These fixes are not a guarantee against every possible vulnerability.

---

# Rippl — Security Review

**Date:** 2026-09-09
**Scope:** whole application — `src/`, `firestore.rules`, `firebase.json`, build output in `dist/`, dependency tree, and the live deployment at `saarthaii.web.app`.
**Reviewer:** Claude Code (static review + read-only verification against the live key/site)

> ⚠️ This file names exploitable weaknesses in a **live production app**. Do not commit it to a public repository while finding 1's residual risk stands.

---

## Update — 2026-09-09, after the Cloudflare rewrite

The app was rewritten onto Workers + D1 + R2 in the same session. See `MIGRATION.md`. Findings 2-10 are closed **in code**; finding 1 stays open until you rotate the key and take the old Firebase Hosting site down, because the burned key is still being served from `saarthaii.web.app` right now.

| # | Finding | Status |
|---|---|---|
| 1 | Gemini key public and unrestricted | **Distribution stopped; residual risk accepted.** The key is out of the client (no key and no `generativelanguage` reference anywhere in `dist/`) and is now a Worker secret. Firebase Hosting was replaced with a redirect-only site on 2026-09-11, so the bundle containing the key is no longer served — verified: `/assets/LogTab-Ch-9Krw1.js` returns 301, not the JS. **The key itself was not rotated, by the owner's decision.** It was publicly served for an unknown period, so anyone who harvested it still holds a working, unrestricted credential. Rotating remains the only thing that revokes that. |
| 2 | Points economy forgeable | Closed. No client writes exist. Points come from `worker/lib/catalog.ts`; the model names the action, never the score, and free-form actions are capped at 25 points. Redemption cost/level/balance are enforced in `worker/routes/rewards.ts`, with the `redemptions` primary key making double-spend impossible (verified against local D1). |
| 3 | All emails readable by any signed-in user | Closed. `email` is returned only by `GET /api/me` for the owner. The leaderboard projects `uid, display_name, points`. |
| 4 | Three conflicting admin sources | Closed. One `users.is_admin` column, checked by middleware on every `/api/admin` route. Bootstrap is a deliberate one-off SQL statement (`MIGRATION.md` §4); the API refuses to remove the last admin. |
| 5 | `setupAdmin.ts` self-executing privilege grant | Closed. File deleted. |
| 6 | Unbounded base64 images | Closed. Photos are R2 objects, content-addressed and deduplicated; the feed returns URLs. 5 MB cap, type allowlist, and per-day/per-hour rate limits in D1. |
| 7 | Client-supplied post identity | Closed. `posts` and `comments` store only `user_id`; author name and avatar are joined from `users` at read time. |
| 8 | Likes denied by rules, failure swallowed | Closed. `post_likes` is its own table and `POST /api/posts/:id/like` works for any signed-in user. Errors surface in the card instead of an empty `catch`. |
| 9 | No security headers | Closed. CSP, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` via `public/_headers` for documents and `hono/secure-headers` for API responses (both verified against `wrangler dev`). |
| 10 | Privacy policy promised rights that did not exist | Closed. `GET /api/me/export` and `DELETE /api/me` are implemented and wired into the profile tab. Deletion cascades across posts, comments, likes, actions, badges and redemptions, settles counters on other people's posts, and sweeps orphaned R2 objects (verified against local D1). Policy copy updated to name Cloudflare and to state that feed photos are visible to signed-in members. |
| 11 | `npm audit` noise | Unchanged and still not in the browser bundle. The Firestore SDK is no longer bundled at all, so the grpc/protobuf chain is now dead weight rather than merely unused — `npm audit fix` when convenient. |
| 12 | Dev server on all interfaces | Closed. `npm run dev` is now `wrangler dev` (localhost); `npm run dev:client` keeps `--host` for phone testing. |

### One deliberate tradeoff introduced

`GET /img/<key>` is **unauthenticated**. Photos used to sit behind a Firestore rule requiring sign-in; they are now served from R2 to anyone holding the URL. The key is a SHA-256 content hash, so it is unguessable, and the feed that reveals it is still behind auth — but a leaked URL is a leaked photo, with no session check behind it. This is the standard way user media is served (a browser cannot attach an `Authorization` header to an `<img src>`), and it buys immutable edge caching. If you would rather not accept it, the fix is short-lived signed URLs or a session cookie scoped to `/img`.

### Two behaviour changes worth knowing about

- **Badges now match their descriptions.** The old client unlocked "metro master" and "solar pioneer" on account level, while the UI next to them promised 10 metro commutes and 5 solar days. `worker/lib/badges.ts` implements what the descriptions say, and "community champion" is now a real top-10 check. Badges only ratchet forward, so nobody loses one they had.
- **Two things were removed rather than reimplemented.** The leaderboard's per-row trend badge rendered `Math.floor(Math.random() * 5)` — invented data, and there is no rank history to replace it with. The feed's admin "Set points" control edited a display field that is now the record of what was actually awarded, so editing it would make the feed lie.

---

## Original review (2026-09-09, pre-migration)

## Summary

| # | Severity | Finding | Verified |
|---|----------|---------|----------|
| 1 | **Critical** | Live Gemini API key is publicly served from production and is unrestricted | ✅ confirmed live |
| 2 | **High** | Points / CO₂ / water / rewards economy is entirely client-authoritative | ✅ from rules |
| 3 | **High** | Every signed-in user can read every user record, including email addresses | ✅ from rules |
| 4 | **Medium** | Admin model has three conflicting sources of truth; the real one is never set | ✅ from code |
| 5 | **Medium** | `src/setupAdmin.ts` is a self-executing privilege-grant script inside the app bundle path | ✅ from code |
| 6 | **Medium** | Unbounded base64 image writes — storage/egress cost amplification | ✅ from code |
| 7 | **Medium** | Post and comment identity fields are client-supplied and unvalidated (impersonation) | ✅ from rules |
| 8 | **Low** | Likes and comment counts are denied by the rules and the failure is silently swallowed | ✅ from rules |
| 9 | **Low** | No CSP or security headers on Firebase Hosting | ✅ from config |
| 10 | **Low** | Privacy policy promises rights the app cannot deliver (deletion, export) | ✅ from code |
| 11 | **Info** | `npm audit` reports 1 critical / 7 high — none reach the browser bundle | ✅ verified |
| 12 | **Info** | `npm run dev` binds the dev server to all network interfaces | ✅ from config |

---

## 1. Critical — the Gemini API key is public and unrestricted

`src/gemini.ts:11-16` reads `VITE_GEMINI_API_KEY` and puts it in a query string. Anything prefixed `VITE_` is inlined into the client bundle by Vite at build time, so the key is a literal string in the shipped JavaScript.

Confirmed exploitable, not theoretical:

```
GET https://saarthaii.web.app/assets/LogTab-Ch-9Krw1.js  →  200, 21,053 bytes
  contains the literal key + generativelanguage.googleapis.com/v1beta/…
GET https://generativelanguage.googleapis.com/v1beta/models?key=<that key>  →  200
  from curl, no Referer header → the key has no HTTP-referrer restriction
```

Anyone who opens the app, or simply fetches that one URL, gets a working Gemini key they can bill to your Google AI account with no rate limit and no origin check. `.env` itself is correctly gitignored and has never been committed — that part is fine. The leak is entirely through the deployed build.

**Fix, in order:**
1. Rotate the key now in Google AI Studio / Cloud Console. Treat the current one as burned.
2. Move the call server-side — a Cloud Function or a Cloudflare Worker that holds the key and takes the image from an authenticated caller. <cc-memory filenames="rippl-cloudflare-migration.md">The Workers + D1 migration you have already scoped is the natural home for this.</cc-memory>
3. Until that lands, at minimum add an API-key restriction (HTTP referrer `saarthaii.web.app/*`) — weak, since referrers are forgeable, but it stops casual reuse.
4. Redeploy so the old chunk stops being served.

Note that the Firebase Web API key in `src/firebase.ts:7` is a *different* thing and is fine to be public — that's how the Firebase web SDK works. I checked that email/password and anonymous sign-up are disabled on the project (`accounts:signUp` returns `ADMIN_ONLY_OPERATION`), so Google sign-in is the only path in. Good.

---

## 2. High — the entire scoring and rewards economy can be forged from the browser console

`firestore.rules:17`:

```
allow update: if admin() || (signedIn() && request.auth.uid == userId
                             && request.resource.data.isAdmin == resource.data.isAdmin);
```

The only field this constrains is `isAdmin`. Every other field on your own user document is freely writable. Any signed-in user can run, in devtools:

```js
updateDoc(doc(db, 'users', auth.currentUser.uid), {
  points: 999999, co2Saved: 99999, waterSaved: 99999, streak: 365,
  redeemedRewards: ['r1','r2','r3'],
  badges: { b1:{unlocked:true,progress:100}, /* … */ },
})
```

…and top the leaderboard, unlock every badge, and mark rewards redeemed. Since rewards are real-world vouchers from named partners (Enova, Lulu — `src/tabs/RewardsTab.tsx:51-62`), this is fraud with a cash value, not just a cosmetic leaderboard problem.

Three separate things stack here:

- **Rules don't validate values.** No `request.resource.data.points is int`, no delta bound, no `resource.data.points + N` check.
- **Redemption is client-side.** `src/tabs/RewardsTab.tsx:110-118` checks affordability in JS, then writes `increment(-cost)` and `arrayUnion(id)`. Skipping the decrement is a one-line change for an attacker.
- **AI verification is client-side and its output is trusted verbatim.** `src/tabs/LogTab.tsx:211,227,245,276` awards `result.points` — a number that came back from a Gemini call the browser made, using a key the browser holds. An attacker doesn't even need to fake the response; they can just call `addPoints()` directly.

**Fix:** points must be awarded by trusted code. Move the verify-and-award step into a callable Cloud Function / Worker that (a) holds the Gemini key, (b) computes points from a server-side table keyed on the action, not from model output, (c) enforces per-day and per-action limits, and (d) writes the user doc with the Admin SDK. Then tighten the rule so clients cannot write `points`, `co2Saved`, `waterSaved`, `streak`, `badges` or `redeemedRewards` at all:

```
allow update: if signedIn() && request.auth.uid == userId
  && !request.resource.data.diff(resource.data).affectedKeys()
       .hasAny(['points','co2Saved','waterSaved','streak','badges','redeemedRewards','isAdmin','email']);
```

Leave `displayName`, `location`, `photoURL` client-writable.

---

## 3. High — every signed-in user can read every user record, including emails

`firestore.rules:15` is `allow read: if signedIn()` with no constraint, which covers `list` as well as `get`. Any account — and anyone can make one with any Google account — can enumerate the whole `users` collection:

```js
getDocs(collection(db, 'users'))  // → every profile, every email
```

The rule's own comment on line 13 says *"Keep sensitive details out of this collection"*, but `src/App.tsx:158` writes `email: user.email?.toLowerCase()` into exactly that collection. `src/tabs/AdminTab.tsx:82` also queries on it, and `src/tabs/RankTab.tsx:33` already streams 50 full user documents to every client just to render a leaderboard that displays only name and points.

Given the app's audience skews young and community-based, a full name + email + coarse location list is a meaningful disclosure, not a nuisance.

**Fix:** split the data. Keep public leaderboard fields (`displayName`, `photoURL`, `points`) in `users/{uid}`, and move `email` — plus anything else identity-bearing — into `users/{uid}/private/profile` with `allow read: if request.auth.uid == userId`. Admin email lookup then belongs in a Cloud Function, not a client query.

---

## 4. Medium — the admin model has three sources of truth, and the authoritative one is never set

| Location | What it checks |
|---|---|
| `firestore.rules:10` (`admin()`) | `request.auth.token.admin == true` — a **custom claim** |
| `src/App.tsx:136` | `(await fbUser.getIdTokenResult()).claims.admin === true` — the claim |
| `src/tabs/FeedTab.tsx:297` | `(appCtx.userData as any)?.isAdmin` — a **Firestore document field** |
| `src/tabs/AdminTab.tsx:90,102` and `src/setupAdmin.ts:16` | *write* the document field |

Nothing in the repository ever sets the custom claim — there is no `functions/` directory, no `firebase-admin` dependency, no `setCustomUserClaims` call anywhere. So `admin()` is permanently false, which means:

- The admin panel (`AdminTab`) is unreachable for everyone, including you.
- `sponsoredRewards` writes (`AdminTab.tsx:109,120`) are always denied — the sponsored-reward feature cannot work.
- "Grant admin" (`AdminTab.tsx:90`) is always denied by rule 17, because a non-admin cannot change `isAdmin` even on someone else's doc.
- `FeedTab` shows admin post controls (edit any post's points, strip images, delete) based on a *different* signal than the one the rules enforce — so the UI and the enforcement disagree by construction.

This is not currently escalatable: a user cannot set their own `isAdmin` (rule 17 pins it), and the FeedTab admin buttons would be denied server-side anyway. But it is one rule edit away from being a real privilege-escalation bug, and today it means the admin feature is silently broken.

**Fix:** pick the custom claim as the single source of truth. Add a Cloud Function that sets `admin: true` via the Admin SDK (guarded by an allowlist or an existing admin), have every client gate read `claims.admin`, and delete the `isAdmin` document field entirely — including the read at `FeedTab.tsx:297` and the writes in `AdminTab`.

---

## 5. Medium — `src/setupAdmin.ts` is a self-executing privilege-grant script

```ts
// src/setupAdmin.ts:21
setupAdminUser('aarush.uae@gmail.com')
```

That call is at module top level, not inside a function or a guard. The file is not currently imported anywhere, so it does not ship — but it sits in `src/`, and a single stray import (or a tool that globs `src/**`) would ship a script into the production bundle that finds a user by hardcoded email and flips them to admin on every page load, for every visitor.

It also hardcodes your personal email in source, and it cannot succeed against the current rules anyway (see #4).

**Fix:** delete the file. Admin bootstrap belongs in a one-off Admin SDK script run locally, never in `src/`.

---

## 6. Medium — unbounded base64 images are a cost amplification vector

`src/utils.ts:11-46` compresses uploads to just under 1 MB of base64, then:

- `src/tabs/LogTab.tsx:184` writes it into `posts`
- `src/tabs/LogTab.tsx:196` writes **the same image again** into `userActions`
- `src/tabs/ProfileTab.tsx:102` writes an avatar into the user doc
- `src/tabs/FeedTab.tsx:76` writes one into a manual post

`firestore.rules:23` allows post creation with no size cap and no rate limit. A signed-in user can script thousands of ~1 MB documents. Worse, `src/tabs/FeedTab.tsx:236` streams the newest 50 posts *with their images inline* to every client on every feed load — 50 posts × ~1 MB is ~50 MB of Firestore egress per feed view, per user, and it's a realtime `onSnapshot` listener.

Two documents also sit right at the 1 MiB Firestore limit: `dataUrl.length > 1048000` (`utils.ts:36`) leaves ~500 bytes of headroom for every other field on the document, so large posts will intermittently fail to write.

**Fix:** put images in Cloud Storage and store the download URL in Firestore. Add Storage rules with a size cap and a content-type check. Stop double-writing the image to both `posts` and `userActions`. Have the feed query select only the fields it renders, and load images lazily by URL.

---

## 7. Medium — post and comment identity fields are client-supplied

`firestore.rules:23` and `:28` validate only `userId`. Everything else on a post is whatever the client sends. `src/tabs/FeedTab.tsx:67-68` and `:377`, and `src/tabs/LogTab.tsx:174-186`, all set `userName`, `userAvatar` and `points` from the client. A user can post as `userName: "Rippl Team"` with `points: 5000` and it renders verbatim in the feed (`FeedTab.tsx:403`) and comments (`FeedTab.tsx:537`).

React escapes the text, so there is no XSS here — I checked for `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `document.write` and `srcdoc` across `src/`, `index.html` and `public/`, and there are none. This is impersonation and display-integrity, not script injection.

**Fix:** either validate in rules (`request.resource.data.userName == <trusted source>` isn't available, so) drop the denormalised name/avatar from the document and join against `users/{userId}` at read time, or write these fields from a Cloud Function.

---

## 8. Low — likes and comment counts are denied by the rules, and the failure is hidden

`firestore.rules:24` allows a post update only by the post's owner. But:

- `src/tabs/FeedTab.tsx:317-326` — liking runs `tx.set(doc(db,'posts',post.id), …, {merge:true})` on **someone else's** post → denied.
- `src/tabs/FeedTab.tsx:381` — `commentsCount: increment(1)` on someone else's post → denied.

So likes only work on your own posts, and comment counts never increment on anyone else's. The `catch {}` at `FeedTab.tsx:329-330` swallows the error entirely, and the optimistic local state update at `:327-328` makes the UI look like it worked until the next snapshot. Comments themselves *do* save (the subcollection rule permits it) — only the counter fails, so counts drift permanently out of sync.

**Fix:** allow non-owners to modify exactly the interaction fields, e.g.

```
allow update: if admin()
  || (signedIn() && resource.data.userId == request.auth.uid)
  || (signedIn() && request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['likes','likesCount','commentsCount']));
```

and stop swallowing the error — surface it, or at least log it.

---

## 9. Low — no security headers

`firebase.json:12-27` sets only `Cache-Control`. There is no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`. There's no XSS sink in the app today (see #7), so CSP is defence-in-depth rather than a fix for a live bug — but it is cheap, and it would have limited the blast radius of an injected script exfiltrating the Gemini key.

A workable starting policy, given the app's actual origins (Google Fonts, Firebase, Gemini, Openverse, Unsplash, Google Drive/Dropbox images):

```json
{ "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.openverse.org; frame-ancestors 'none'; base-uri 'self'" },
{ "key": "X-Content-Type-Options", "value": "nosniff" },
{ "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
```

Test it against the sign-in popup before shipping — `signInWithPopup` needs the Firebase auth domain reachable.

---

## 10. Low — the privacy policy promises rights the app cannot deliver

`src/tabs/PrivacyTab.tsx:80` states users have *"the full right to export your complete action record or permanently delete your account at any time directly through your profile settings."*

Neither exists. `firestore.rules:18` is `allow delete: if false` on user documents, and `ProfileTab` offers only sign-out (`ProfileTab.tsx:246`) — no delete, no export.

`PrivacyTab.tsx:39` also claims records are *"stored in access-controlled … cloud infrastructure"*, which sits awkwardly against finding #3, where every signed-in user can read every email.

The policy is otherwise honest about the Gemini dependency and the photo collection. Two things it doesn't disclose that it probably should: proof photos are visible to **every** signed-in user via the community feed, and photos are sent to Google's `v1beta` generative API directly from the browser.

**Fix:** either build account deletion and export (a Cloud Function doing an Admin SDK cascade delete across `users`, `posts`, `posts/*/comments`, `userActions`), or amend the wording to describe an email-request process you will actually honour. Given the audience likely includes minors, the deletion path is worth building rather than rewording.

---

## 11. Info — `npm audit` findings do not reach the browser

`npm audit` reports 1 critical and 7 high. I checked whether any of them actually ship:

| Package | Advisory | Reaches `dist/`? |
|---|---|---|
| `websocket-driver` ≤0.7.4 | critical — compression resource-limit bypass | **No** — 0 references in built chunks |
| `@grpc/grpc-js` ≤1.9.15 | high — malformed-request crash | **No** — 0 references |
| `protobufjs` ≤7.6.4 | high — DoS via Any expansion | **No** — 0 references |
| `vite` 8.0.0–8.0.15 | high — `server.fs.deny` bypass (Windows) | Dev-server only |

The first three are transitive from `firebase@12.13.0`'s **Node** code paths (`@firebase/firestore` → grpc, `@firebase/database` → faye-websocket), which a browser build never bundles — I confirmed zero references in every chunk under `dist/assets/`. They're audit noise for this deployment.

Still worth running `npm audit fix` to keep the tree clean and the signal readable, and to pick up the Vite patch since `npm run dev` is exposed (see #12). Nothing here is urgent relative to findings 1–3.

---

## 12. Info — the dev server binds to all interfaces

`package.json:9` — `"dev": "vite --host"` serves on every network interface, so anyone on the same Wi-Fi can reach your dev instance, which is built with the real `.env` values. Combined with the unpatched Vite advisory above, prefer `vite` alone and add `--host` only when you actually need to test on a phone.

---

## What I checked and found clean

- **XSS** — no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`, `insertAdjacentHTML`, `srcdoc`, or `javascript:` URLs anywhere in `src/`, `index.html`, or `public/`.
- **Secrets in git** — `.env` is gitignored and has never appeared in any commit across all refs. No API key appears in tracked history.
- **Auth surface** — email/password and anonymous sign-up are disabled on the Firebase project; Google OAuth is the only entry point.
- **Outbound links** — every `target="_blank"` carries `rel="noreferrer"` (`LandingPage.tsx:120`, `ShareImageSearch.tsx:98,107`, `RewardsTab.tsx:299`).
- **`ShareImageSearch.tsx`** — genuinely careful third-party handling: HTTPS-only URL validation (`:14,51`), license and `mature` filtering, blob type and 15 MB size check (`:81`), abort controllers with timeouts, and image bytes inlined before canvas export so a remote host can't taint it (`:77-78`). Good work.
- **`sponsoredImages.ts`** — URL rewriting is scheme-checked and falls back safely; `encodeURIComponent` applied to bucket and path.
- **`userActions` and `sponsoredRewards` read rules** — correctly scoped.
- **Firestore default deny** — no collection is exposed by an overly broad `match`.

---

## Suggested order of work

1. **Today** — rotate the Gemini key (#1). It is being served publicly right now.
2. **This week** — server-side verification + points award, and lock down the `users` update rule (#2). Split `email` out of the public profile (#3).
3. **Next** — collapse the admin model onto custom claims and delete `setupAdmin.ts` (#4, #5). Fix the like/comment rules while you're in the file (#8).
4. **Then** — move images to Cloud Storage (#6), denormalise identity out of posts (#7), add CSP (#9), build deletion/export or amend the policy (#10).
