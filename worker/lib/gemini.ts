import type { Env } from '../types'
import { fail } from './http'
import { ACTIONS, ACTIONS_BY_ID, CATEGORIES, FREEFORM_MAX_POINTS, FREEFORM_MIN_POINTS, type Category } from './catalog'

export interface Verdict {
  confidence: number
  reason: string
  actionId: string | null
  label: string
  category: Category
  points: number
  co2: number
  water: number
}

const PROMPT = `You are a sustainability action verifier.

Analyze the photo evidence provided. Identify the sustainability action shown.
Prefer one of these known action ids when the photo matches:
${ACTIONS.map(a => `${a.id} = ${a.label} (${a.category})`).join('\n')}

If none match but the photo still shows a genuine sustainability action, set actionId to null and name it yourself.
If the photo shows no sustainability action at all, return confidence 0.

Respond with ONLY valid JSON (no markdown, no backticks) in this exact shape:
{"confidence": 0-100, "reason": "brief 1-sentence explanation", "actionId": "t1" or null, "label": "name of action", "category": "transport|food|energy|water|waste"}`

/* The model names the action; it never sets the score. Points come from the
   catalogue for a known action, and from a tight fixed band for anything
   free-form, so a tampered or prompt-injected response cannot inflate a total. */
export async function verifyPhoto(env: Env, bytes: ArrayBuffer, contentType: string): Promise<Verdict> {
  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: contentType, data: base64(bytes) } },
        ],
      },
    ],
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    },
  )

  if (!response.ok) {
    // The upstream error can quote the request; it never reaches the client.
    console.error('Gemini error', response.status, (await response.text()).slice(0, 500))
    throw fail(502, 'Verification is unavailable right now. Please try again in a moment.')
  }

  const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(text.replace(/```json\s*/gi, '').replace(/```/g, '').trim())
  } catch {
    throw fail(502, 'Verification returned an unreadable result. Please try again.')
  }

  const confidence = clamp(Number(parsed.confidence) || 0, 0, 100)
  const known = typeof parsed.actionId === 'string' ? ACTIONS_BY_ID.get(parsed.actionId) : undefined

  if (known) {
    return {
      confidence,
      reason: String(parsed.reason ?? '').slice(0, 200),
      actionId: known.id,
      label: known.label,
      category: known.category,
      points: known.points,
      co2: known.co2,
      water: known.water,
    }
  }

  const category = CATEGORIES.includes(parsed.category as Category) ? (parsed.category as Category) : 'waste'
  return {
    confidence,
    reason: String(parsed.reason ?? '').slice(0, 200),
    actionId: null,
    label: String(parsed.label ?? 'Sustainable action').slice(0, 80),
    category,
    // Free-form actions scale with confidence inside a narrow band, never
    // with anything the model asked for.
    points: Math.round(FREEFORM_MIN_POINTS + ((FREEFORM_MAX_POINTS - FREEFORM_MIN_POINTS) * confidence) / 100),
    co2: 0,
    water: 0,
  }
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function base64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}
