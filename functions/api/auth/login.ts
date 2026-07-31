import type { Env, WikiUser } from '../_shared'
import { json, error, verifyPassword, createToken } from '../_shared'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { username, password } = await request.json() as { username?: string; password?: string }
  if (!username || !password) return error('缺少用户名或密码')

  const usersRaw = await env.NEKOWIKI_KV.get('config:users', 'json') as string[] | null
  if (!usersRaw) return error('用户名或密码错误', 401)

  for (const uid of usersRaw) {
    const user = await env.NEKOWIKI_KV.get(`user:${uid}`, 'json') as WikiUser | null
    if (user && user.username === username) {
      const valid = await verifyPassword(password, user.passwordHash)
      if (valid) {
        const token = await createToken(env, user.id, user.role)
        return json({ ok: true, token, user: { id: user.id, username: user.username, role: user.role } })
      }
      break
    }
  }

  return error('用户名或密码错误', 401)
}
