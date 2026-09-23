# rippl

small actions add up. rippl makes them visible.

log a sustainable action with a photo, get it checked, and see your estimated carbon and water savings. points, streaks, badges, a community feed, and rewards give you a reason to keep going.

[try rippl](https://rippl.aarush-uae.workers.dev/app)

## how it works

1. pick an action and add a photo.
2. ai checks whether the photo supports it.
3. rippl awards points from a fixed action list and adds the estimated impact to your progress.

the numbers are estimates, not exact measurements of what one photo saved.

## run it locally

you'll need node, a firebase project for google sign-in, and a gemini api key.

```bash
npm ci
cp .env.example .env
cp .dev.vars.example .dev.vars
```

fill in the firebase values in `.env` and the gemini key in `.dev.vars`, then:

```bash
npm run build
npm run db:init:local # once for a fresh local database
npm run dev
```

the app runs on a cloudflare worker with d1 for data and r2 for photos. the frontend is react and typescript; firebase handles sign-in. for production, set the worker secret with `npx wrangler secret put GEMINI_API_KEY`, initialize a fresh d1 database with `npm run db:init`, then run `npm run deploy`.
