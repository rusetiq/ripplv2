# RIPPL Project Brief

**Tagline:** Translating everyday sustainable habits into visible, verified environmental progress.

## Project links

- **Live application:** https://rippl.aarush-uae.workers.dev/app
- **Source code:** https://github.com/rusetiq/rippl

## The challenge

Many people want to make environmentally responsible choices, but actions such as taking public transport, eating a plant-based meal, conserving water, or recycling are usually private and difficult to measure. Without clear feedback, trusted evidence, or a sense of progress, it is hard to sustain those habits over time.

## Our solution

Rippl is a mobile-first web app that lets people record sustainable actions, attach photo evidence, and see a clear, ongoing record of their estimated environmental impact. The product makes the next action simple, then connects individual progress to community activity, rankings, badges, and rewards.

## How the innovation works

1. **Log an action.** A user selects or describes a sustainable action and uploads a photo.
2. **Verify with AI.** Gemini vision AI analyses the photo to determine whether it supports the claimed action and returns a confidence score.
3. **Calculate impact from data.** Approved, catalogue-based actions map to fixed points and estimated carbon-dioxide and water-saving values. This helps keep impact scoring consistent instead of allowing the AI model to invent scores.
4. **Build lasting habits.** The app presents personal impact, streaks, badges, a community feed, rankings, and rewards to make consistency feel worthwhile.

## Data, AI, app, and space science

| Area | Role in Rippl |
| --- | --- |
| **App** | A responsive React and TypeScript web application for logging actions, viewing impact, participating in the community, and redeeming rewards. |
| **AI** | Gemini-powered image verification identifies sustainability actions in submitted photo evidence and reports a confidence result. |
| **Data** | A structured action catalogue associates known actions with consistent point, carbon, and water values, enabling transparent personal and community reporting. |
| **Space science** | A future Earth-observation layer can add city-level environmental context, such as vegetation cover, land-surface heat, air-quality indicators, and weather conditions. It would connect personal actions to the wider condition of the places where people live. |

## Current technology

- React, TypeScript, and Vite frontend
- Cloudflare Workers edge backend
- Cloudflare D1 database and R2 photo storage
- Firebase authentication
- Gemini Vision API for photo verification
- Responsive light and dark interface

## Why it matters

Rippl makes climate-positive choices easier to see, trust, and repeat. By turning a single action into meaningful feedback and making collective progress visible, it can help individuals and communities build sustained participation in environmental action.

## Research and evidence approach

- Use an auditable action catalogue rather than model-generated impact values for recognised actions.
- Require photo evidence and an AI confidence check before crediting a submitted action.
- Treat all impact figures as estimates that should be transparently sourced, reviewed, and updated as better local environmental data becomes available.
- Use satellite and Earth-observation indicators as contextual community data, not as proof of an individual user’s action.

---

For a two-minute overview, see the accompanying project video submission.
