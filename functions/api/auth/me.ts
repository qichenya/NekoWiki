import type { Env, WikiUser } from '../_shared'
import { json, requireAuth } from '../_shared'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAuth(request, env)
  if (result instanceof Response) return result

  const user = await env.NEKOWIKI_KV.get(`user:${result.userId}`, 'json') as WikiUser | null
  if (!user) return json({ error: '用户不存在' }, 404)

  return json({ id: user.id, username: user.username, role: user.role })
}
