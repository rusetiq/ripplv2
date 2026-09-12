import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const fail = (status: 400 | 401 | 403 | 404 | 409 | 413 | 429 | 502, message: string) =>
  new HTTPException(status, { res: Response.json({ error: message }, { status }) })

export const nowSeconds = () => Math.floor(Date.now() / 1000)

export const newId = () => crypto.randomUUID()

/* A day key in UTC. Streaks and daily caps both hang off this, so they roll
   over at the same instant for every user regardless of device timezone. */
export const dayKey = (at = Date.now()) => new Date(at).toISOString().slice(0, 10)

export function clampText(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export function requireText(value: unknown, max: number, field: string): string {
  const text = clampText(value, max)
  if (!text) throw fail(400, `${field} is required`)
  return text
}

export async function readJson<T>(c: Context): Promise<T> {
  try {
    return (await c.req.json()) as T
  } catch {
    throw fail(400, 'Expected a JSON body')
  }
}
