import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import type { Identity } from './lib/auth'

export interface Env {
  DB: D1Database
  PHOTOS: R2Bucket
  FIREBASE_PROJECT_ID: string
  GEMINI_MODEL: string
  GEMINI_API_KEY: string
}

export interface Vars {
  identity: Identity
  user: UserRow
}

export interface UserRow {
  uid: string
  email: string
  display_name: string
  location: string
  photo_key: string | null
  photo_url: string
  points: number
  co2_saved: number
  water_saved: number
  streak: number
  last_active_date: string
  is_admin: number
  created_at: number
}

export type App = { Bindings: Env; Variables: Vars }
