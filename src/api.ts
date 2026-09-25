import { auth } from './firebase'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/* Firebase mints a fresh ID token when the current one is close to expiring,
   so this is cheap to call before every request. */
async function authHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) throw new ApiError(401, 'You are signed out.')
  return { Authorization: `Bearer ${await user.getIdToken()}` }
}

async function unwrap<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T
  let message = 'Something went wrong.'
  try {
    message = ((await response.json()) as { error?: string }).error ?? message
  } catch {
    // Keep the default message when the error body is not JSON.
  }
  throw new ApiError(response.status, message)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), ...(await authHeader()) },
    signal: init.signal ?? AbortSignal.timeout(30_000),
  })
  return unwrap<T>(response)
}

const json = <T>(path: string, method: string, body: unknown, signal?: AbortSignal) =>
  request<T>(path, { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal })

export interface Me {
  uid: string
  email: string
  displayName: string
  location: string
  photoURL: string
  points: number
  co2Saved: number
  waterSaved: number
  streak: number
  level: number
  lastActiveDate: string
  isAdmin: boolean
  badges: Record<string, { unlocked: boolean; progress: number }>
  redeemedRewards: string[]
}

export interface Author { uid: string; displayName: string; photoURL: string }

export interface Post {
  id: string
  author: Author
  category: string
  action: string
  impact: string
  points: number
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  liked: boolean
  createdAt: number
}

export interface Comment { id: string; text: string; createdAt: number; author: Author }

export interface Player { rank: number; uid: string; name: string; photoURL: string; points: number; isUser: boolean }

export interface Sponsored { id: string; name: string; subtitle: string; href: string; imageUrl: string; points: number; badge: string }

export interface Verdict {
  accepted: boolean
  confidence: number
  reason: string
  label?: string
  category?: string
  points?: number
  me?: Me
}

export const api = {
  me: (signal?: AbortSignal) => request<Me>('/me', { signal }),
  updateMe: (body: { displayName?: string; location?: string }) => json<Me>('/me', 'PATCH', body),
  deleteMe: () => json<{ deleted: boolean }>('/me', 'DELETE', { confirm: 'DELETE' }),

  uploadAvatar: (file: Blob) =>
    request<{ photoURL: string }>('/me/avatar', { method: 'POST', body: file, headers: { 'Content-Type': file.type } }),

  exportData: async () => {
    const response = await fetch('/api/me/export', { headers: await authHeader() })
    if (!response.ok) throw new ApiError(response.status, 'Could not build your export.')
    return response.blob()
  },

  verifyPhoto: (file: Blob, actionId?: string) =>
    request<Verdict>(`/actions/verify${actionId ? `?actionId=${encodeURIComponent(actionId)}` : ''}`, {
      method: 'POST',
      body: file,
      headers: { 'Content-Type': file.type },
      // A cold Worker plus a model round trip can take a while on mobile data.
      signal: AbortSignal.timeout(60_000),
    }),

  /* Openverse images live on third-party CDNs. Routing them through the Worker
     keeps the page's connect-src at 'self' and makes the bytes same-origin, so
     the share card's export canvas is never tainted. */
  proxyImage: async (url: string, signal?: AbortSignal) => {
    const response = await fetch(`/api/images/proxy?url=${encodeURIComponent(url)}`, {
      headers: await authHeader(),
      signal: signal ?? AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      let message = 'This photo could not be loaded. Try another result.'
      try { message = ((await response.json()) as { error?: string }).error ?? message } catch { /* Keep the default message. */ }
      throw new ApiError(response.status, message)
    }
    return response.blob()
  },

  photo: async (path: string, signal: AbortSignal) => {
    if (!path.startsWith('/api/photos/')) throw new ApiError(400, 'Invalid photo path')
    const response = await fetch(path, { headers: await authHeader(), signal, cache: 'no-store' })
    if (!response.ok) throw new ApiError(response.status, 'Could not load photo')
    return response.blob()
  },

  week: (signal?: AbortSignal) => request<{ days: { day: string; points: number }[] }>('/actions/week', { signal }),

  feed: (signal?: AbortSignal) => request<{ posts: Post[]; nextCursor: number | null }>('/posts?limit=25', { signal }),
  myPosts: (signal?: AbortSignal) => request<{ posts: Post[] }>('/posts/mine/list', { signal }),

  createPost: (text: string, photo: Blob | null) => {
    const form = new FormData()
    form.set('text', text)
    if (photo) form.set('photo', photo, 'photo')
    return request<{ id: string }>('/posts', { method: 'POST', body: form })
  },
  editPost: (id: string, text: string) => json<{ ok: true }>(`/posts/${id}`, 'PATCH', { text }),
  removePostImage: (id: string) => json<{ ok: true }>(`/posts/${id}`, 'PATCH', { removeImage: true }),
  deletePost: (id: string) => request<{ ok: true }>(`/posts/${id}`, { method: 'DELETE' }),
  like: (id: string) => request<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`, { method: 'POST' }),
  comments: (id: string, signal?: AbortSignal) => request<{ comments: Comment[] }>(`/posts/${id}/comments`, { signal }),
  addComment: (id: string, text: string) => json<{ ok: true }>(`/posts/${id}/comments`, 'POST', { text }),

  leaderboard: (signal?: AbortSignal) => request<{ players: Player[]; self: Player }>('/leaderboard', { signal }),

  sponsored: (signal?: AbortSignal) => request<{ sponsored: Sponsored[] }>('/rewards/sponsored', { signal }),
  redeem: (id: string) => json<{ ok: true; me: Me }>(`/rewards/${id}/redeem`, 'POST', {}),

  admins: (signal?: AbortSignal) => request<{ admins: { uid: string; displayName: string; email: string }[] }>('/admin/admins', { signal }),
  addAdmin: (email: string) => json<{ ok: true }>('/admin/admins', 'POST', { email }),
  removeAdmin: (uid: string) => request<{ ok: true }>(`/admin/admins/${uid}`, { method: 'DELETE' }),
  addSponsored: (body: { name: string; subtitle: string; href: string; imageUrl: string; points: number; badge: string }) =>
    json<{ ok: true }>('/admin/sponsored', 'POST', body),
  removeSponsored: (id: string) => request<{ ok: true }>(`/admin/sponsored/${id}`, { method: 'DELETE' }),
}
