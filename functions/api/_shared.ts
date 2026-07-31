// Cloudflare Pages Functions 共享工具

export interface Env {
  NEKOWIKI_KV: KVNamespace
}

export interface WikiPage {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface WikiUser {
  id: string
  username: string
  passwordHash: string
  role: 'admin' | 'editor'
  createdAt: number
}

export interface SiteConfig {
  passwordHash: string
  jwtSecret: string
  setupComplete: boolean
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
}

// --- 密码哈希 (PBKDF2) ---
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return base64url(salt) + '.' + base64url(hash)
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split('.')
  const salt = base64urlDecode(saltB64)
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return base64url(hash) === hashB64
}

// --- JWT ---
async function getJwtSecret(env: Env): Promise<string> {
  const config = await env.NEKOWIKI_KV.get('config:site', 'json') as SiteConfig | null
  if (config?.jwtSecret) return config.jwtSecret
  // 生成新 secret 并持久化
  const secret = base64url(crypto.getRandomValues(new Uint8Array(32)))
  if (config) {
    config.jwtSecret = secret
    await env.NEKOWIKI_KV.put('config:site', JSON.stringify(config))
  }
  return secret
}

export async function createToken(env: Env, userId: string, role: string): Promise<string> {
  const secret = await getJwtSecret(env)
  const encoder = new TextEncoder()
  const header = base64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = base64url(encoder.encode(JSON.stringify({
    sub: userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 天
  })))
  const data = header + '.' + payload
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
  return data + '.' + sig
}

export async function verifyToken(
  env: Env,
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const secret = await getJwtSecret(env)
    const [header, payload, sig] = token.split('.')
    const encoder = new TextEncoder()
    const data = header + '.' + payload
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    )
    const valid = await crypto.subtle.verify(
      'HMAC', key, base64urlDecode(sig), encoder.encode(data),
    )
    if (!valid) return null
    const decoded = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)))
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null
    return { userId: decoded.sub, role: decoded.role }
  } catch {
    return null
  }
}

export function getTokenFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie')
  if (!cookie) return null
  const match = cookie.match(/nekowiki_token=([^;]+)/)
  return match ? match[1] : null
}

// --- HTTP 响应工具 ---
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status)
}

// --- 认证中间件 ---
export async function requireAuth(
  request: Request,
  env: Env,
): Promise<{ userId: string; role: string } | Response> {
  const token = getTokenFromCookie(request)
  if (!token) return error('未登录', 401)
  const user = await verifyToken(env, token)
  if (!user) return error('登录已过期', 401)
  return user
}

export async function requireAdmin(
  request: Request,
  env: Env,
): Promise<{ userId: string; role: string } | Response> {
  const result = await requireAuth(request, env)
  if (result instanceof Response) return result
  if (result.role !== 'admin') return error('需要管理员权限', 403)
  return result
}
