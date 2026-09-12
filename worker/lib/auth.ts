/* Firebase Auth stays on the client for the Google popup only; the Worker
   never trusts it. Every API call carries the ID token, and it is verified
   here against Google's published keys before any row is touched. */

export interface Identity {
  uid: string
  email: string
  name: string
  picture: string
}

interface Jwk { kid: string; n: string; e: string; kty: string; alg: string }

export class AuthError extends Error {}

/* The key set rotates roughly daily and Google sends a max-age for it, so it is
   cached in module scope for as long as that header allows. An isolate that
   outlives the cache just re-fetches once. */
let keyCache: { keys: Map<string, CryptoKey>; expires: number } | null = null

const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

async function publicKeys(): Promise<Map<string, CryptoKey>> {
  if (keyCache && keyCache.expires > Date.now()) return keyCache.keys

  const response = await fetch(JWK_URL)
  if (!response.ok) throw new AuthError('Could not fetch Google signing keys')
  const body = (await response.json()) as { keys: Jwk[] }

  const keys = new Map<string, CryptoKey>()
  for (const jwk of body.keys) {
    keys.set(
      jwk.kid,
      await crypto.subtle.importKey(
        'jwk',
        { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify'],
      ),
    )
  }

  const maxAge = /max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')
  const ttl = maxAge ? Number(maxAge[1]) * 1000 : 3600_000
  keyCache = { keys, expires: Date.now() + ttl }
  return keys
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function decodeSegment(segment: string): Record<string, unknown> {
  try {
    const value = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)))
    if (!value || typeof value !== 'object') throw new Error('not an object')
    return value as Record<string, unknown>
  } catch {
    // atob and JSON.parse throw their own error types; everything malformed
    // has to arrive at the caller as an AuthError so it becomes a 401.
    throw new AuthError('Malformed token')
  }
}

export async function verifyIdToken(token: string, projectId: string): Promise<Identity> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new AuthError('Malformed token')

  const header = decodeSegment(parts[0]) as { alg?: string; kid?: string }
  if (header.alg !== 'RS256') throw new AuthError('Unexpected token algorithm')
  if (!header.kid) throw new AuthError('Token has no key id')

  const key = (await publicKeys()).get(header.kid)
  if (!key) throw new AuthError('Unknown signing key')

  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlToBytes(parts[2]) as BufferSource,
    signed as BufferSource,
  )
  if (!valid) throw new AuthError('Bad token signature')

  const claims = decodeSegment(parts[1]) as Record<string, unknown>
  const now = Math.floor(Date.now() / 1000)
  // A little leeway so a client whose clock runs slightly fast is not locked out.
  const skew = 60

  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new AuthError('Wrong token issuer')
  if (claims.aud !== projectId) throw new AuthError('Wrong token audience')
  if (typeof claims.exp !== 'number' || claims.exp + skew < now) throw new AuthError('Token expired')
  if (typeof claims.iat !== 'number' || claims.iat - skew > now) throw new AuthError('Token issued in the future')
  if (typeof claims.auth_time === 'number' && claims.auth_time - skew > now) throw new AuthError('Token used before sign-in')
  if (typeof claims.sub !== 'string' || !claims.sub) throw new AuthError('Token has no subject')

  return {
    uid: claims.sub,
    email: typeof claims.email === 'string' ? claims.email.toLowerCase() : '',
    name: typeof claims.name === 'string' ? claims.name : '',
    picture: typeof claims.picture === 'string' ? claims.picture : '',
  }
}
