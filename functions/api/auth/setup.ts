import type { Env, SiteConfig, WikiUser } from '../_shared'
import { json, error, hashPassword, createToken } from '../_shared'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const config = await env.NEKOWIKI_KV.get('config:site', 'json') as SiteConfig | null

  if (config?.setupComplete) {
    return error('系统已初始化', 400)
  }

  const { username, password } = await request.json() as { username?: string; password?: string }
  if (!username || !password) return error('缺少用户名或密码')
  if (password.length < 6) return error('密码至少需要6位')

  const id = crypto.randomUUID()
  const user: WikiUser = {
    id,
    username,
    passwordHash: await hashPassword(password),
    role: 'admin',
    createdAt: Date.now(),
  }

  await env.NEKOWIKI_KV.put(`user:${id}`, JSON.stringify(user))

  const users = [id]
  await env.NEKOWIKI_KV.put('config:users', JSON.stringify(users))

  const siteConfig: SiteConfig = {
    passwordHash: user.passwordHash,
    jwtSecret: '',
    setupComplete: true,
  }
  await env.NEKOWIKI_KV.put('config:site', JSON.stringify(siteConfig))

  const token = await createToken(env, id, 'admin')

  return json(
    { ok: true, token, user: { id: user.id, username: user.username, role: user.role } },
    201,
  )
}
