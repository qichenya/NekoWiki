import type { Env, WikiUser } from '../_shared'
import { json, error, requireAdmin } from '../_shared'

// 管理员：删除用户（不允许删除自己）
export const onRequestDelete: PagesFunction<Env> = async ({ request, params, env }) => {
  const admin = await requireAdmin(request, env)
  if (admin instanceof Response) return admin

  const targetId = params.id as string
  if (targetId === admin.userId) return error('不能删除自己', 400)

  const user = await env.NEKOWIKI_KV.get(`user:${targetId}`, 'json') as WikiUser | null
  if (!user) return error('用户不存在', 404)

  await env.NEKOWIKI_KV.delete(`user:${targetId}`)

  const ids = await env.NEKOWIKI_KV.get('config:users', 'json') as string[] | null
  if (ids) {
    await env.NEKOWIKI_KV.put('config:users', JSON.stringify(ids.filter((i) => i !== targetId)))
  }

  return json({ ok: true })
}
