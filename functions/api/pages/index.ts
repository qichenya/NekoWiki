import type { Env, WikiPage } from '../_shared'
import { json, error } from '../_shared'

// 公共：获取所有页面摘要
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const ids = await env.NEKOWIKI_KV.get('config:pages', 'json') as string[] | null
  if (!ids?.length) return json([])

  const pages: Pick<WikiPage, 'id' | 'title' | 'updatedAt'>[] = []
  for (const id of ids) {
    const page = await env.NEKOWIKI_KV.get(`page:${id}`, 'json') as WikiPage | null
    if (page) {
      pages.push({ id: page.id, title: page.title, updatedAt: page.updatedAt })
    }
  }
  pages.sort((a, b) => b.updatedAt - a.updatedAt)
  return json(pages)
}

// 管理员：创建页面
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { requireAuth, getTokenFromCookie, verifyToken } = await import('../_shared')
  const token = getTokenFromCookie(request)
  if (!token) return error('未登录', 401)
  const user = await verifyToken(env, token)
  if (!user) return error('登录已过期', 401)

  const { title, content } = await request.json() as { title?: string; content?: string }
  if (!title) return error('缺少标题')

  const id = crypto.randomUUID()
  const now = Date.now()
  const page: WikiPage = { id, title: title.trim(), content: content ?? '', createdAt: now, updatedAt: now, createdBy: user.userId }

  await env.NEKOWIKI_KV.put(`page:${id}`, JSON.stringify(page))

  const ids = await env.NEKOWIKI_KV.get('config:pages', 'json') as string[] | null
  const newIds = ids ? [id, ...ids] : [id]
  await env.NEKOWIKI_KV.put('config:pages', JSON.stringify(newIds))

  return json(page, 201)
}
