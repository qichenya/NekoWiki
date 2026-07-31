import type { Env, WikiUser } from '../_shared'
import { json, error, hashPassword, requireAdmin } from '../_shared'

// 管理员：获取所有用户
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await requireAdmin(request, env)
  if (admin instanceof Response) return admin

  const ids = await env.NEKOWIKI_KV.get('config:users', 'json') as string[] | null
  if (!ids?.length) return json([])

  const users: Pick<WikiUser, 'id' | 'username' | 'role' | 'createdAt'>[] = []
  for (const uid of ids) {
    const u = await env.NEKOWIKI_KV.get(`user:${uid}`, 'json') as WikiUser | null
    if (u) {
      users.push({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })
    }
  }
  return json(users)
}

// 管理员：创建新用户
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await requireAdmin(request, env)
  if (admin instanceof Response) return admin

  const { username, password } = await request.json() as { username?: string; password?: string }
  if (!username || !password) return error('缺少用户名或密码')
  if (password.length < 6) return error('密码至少需要6位')

  const ids = await env.NEKOWIKI_KV.get('config:users', 'json') as string[] | null
  // 检查用户名是否已存在
  if (ids) {
    for (const uid of ids) {
      const existing = await env.NEKOWIKI_KV.get(`user:${uid}`, 'json') as WikiUser | null
      if (existing?.username === username) return error('用户名已存在')
    }
  }

  const id = crypto.randomUUID()
  const user: WikiUser = {
    id,
    username,
    passwordHash: await hashPassword(password),
    role: 'editor',
    createdAt: Date.now(),
  }

  await env.NEKOWIKI_KV.put(`user:${id}`, JSON.stringify(user))
  const newIds = ids ? [...ids, id] : [id]
  await env.NEKOWIKI_KV.put('config:users', JSON.stringify(newIds))

  return json(
    { id: user.id, username: user.username, role: user.role, createdAt: user.createdAt },
    201,
  )
}
