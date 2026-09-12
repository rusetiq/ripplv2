/* The authoritative economy. Point values, costs and unlock levels live here
   and nowhere else: the client sends an action id, never an amount, and the
   model's suggested score is clamped against these numbers rather than trusted.
   The UI keeps its own copy of the labels and icons purely for display. */

export interface ActionDef {
  id: string
  label: string
  category: Category
  points: number
  co2: number
  water: number
}

export type Category = 'transport' | 'food' | 'energy' | 'water' | 'waste'

export const CATEGORIES: Category[] = ['transport', 'food', 'energy', 'water', 'waste']

export const ACTIONS: ActionDef[] = [
  { id: 't1', label: 'Metro commute',              category: 'transport', points: 35, co2: 2.4, water: 0 },
  { id: 't2', label: 'Carpooled',                  category: 'transport', points: 25, co2: 1.8, water: 0 },
  { id: 't3', label: 'Cycled to destination',      category: 'transport', points: 40, co2: 3.1, water: 0 },
  { id: 't4', label: 'Walked instead of drove',    category: 'transport', points: 20, co2: 1.2, water: 0 },
  { id: 'f1', label: 'Plant-based meal',           category: 'food',      points: 20, co2: 1.1, water: 0 },
  { id: 'f2', label: 'No food waste today',        category: 'food',      points: 15, co2: 0.5, water: 0 },
  { id: 'f3', label: 'Local produce shopping',     category: 'food',      points: 25, co2: 0.8, water: 0 },
  { id: 'f4', label: 'Brought reusable container', category: 'food',      points: 10, co2: 0.2, water: 0 },
  { id: 'e1', label: 'Solar energy used',          category: 'energy',    points: 80, co2: 6.8, water: 0 },
  { id: 'e2', label: 'AC at 24°C',                 category: 'energy',    points: 30, co2: 2.0, water: 0 },
  { id: 'e3', label: 'Unplugged devices',          category: 'energy',    points: 10, co2: 0.3, water: 0 },
  { id: 'e4', label: 'LED lighting switch',        category: 'energy',    points: 15, co2: 0.5, water: 0 },
  { id: 'w1', label: 'Short shower (< 5min)',      category: 'water',     points: 25, co2: 0,   water: 60 },
  { id: 'w2', label: 'Fixed a leak',               category: 'water',     points: 50, co2: 0,   water: 200 },
  { id: 'w3', label: 'Reused greywater',           category: 'water',     points: 35, co2: 0,   water: 100 },
  { id: 'w4', label: 'Full load laundry only',     category: 'water',     points: 15, co2: 0,   water: 40 },
  { id: 'r1', label: 'Recycled materials',         category: 'waste',     points: 20, co2: 0.9, water: 0 },
  { id: 'r2', label: 'Composted organics',         category: 'waste',     points: 30, co2: 1.5, water: 0 },
  { id: 'r3', label: 'Refused single-use plastic', category: 'waste',     points: 15, co2: 0.3, water: 0 },
  { id: 'r4', label: 'Donated old items',          category: 'waste',     points: 25, co2: 1.2, water: 0 },
]

export const ACTIONS_BY_ID = new Map(ACTIONS.map(a => [a.id, a]))

/* An action the model recognised but that is not in the catalogue still earns
   something, capped well below the best hand-checked action so that inventing
   action names can never out-earn doing the real ones. */
export const FREEFORM_MAX_POINTS = 25
export const FREEFORM_MIN_POINTS = 5

export interface RewardDef { id: string; cost: number; level: number }

export const REWARDS: RewardDef[] = [
  { id: 'r1', cost: 220,  level: 1 },
  { id: 'r2', cost: 700,  level: 1 },
  { id: 'r3', cost: 750,  level: 2 },
  { id: 'r4', cost: 1500, level: 3 },
  { id: 'r5', cost: 2000, level: 4 },
  { id: 'r6', cost: 3600, level: 5 },
  { id: 'r7', cost: 5000, level: 6 },
  { id: 'r8', cost: 8000, level: 8 },
]

export const REWARDS_BY_ID = new Map(REWARDS.map(r => [r.id, r]))

export const levelFor = (points: number) => Math.floor(points / 500) + 1

/* Caps that bound the damage a scripted client can do in a day. */
export const LIMITS = {
  verifyPerDay: 40,
  logsPerDay: 25,
  postsPerHour: 20,
  commentsPerHour: 60,
  maxImageBytes: 5 * 1024 * 1024,
  maxPostLength: 500,
  maxCommentLength: 500,
  maxNameLength: 60,
  maxLocationLength: 80,
}
