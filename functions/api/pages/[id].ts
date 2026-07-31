import type { Env, WikiPage } from '../_shared'
import { json, error, getTokenFromCookie, verifyToken } from '../_shared'

// 公共：获取单个页面
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string
  const page = await env.NEKOWIKI_KV.get(`page:${id}`, 'json') as WikiPage | null
  if (!page) return error('页面不存在', 404)
  return json(page)
}

// 管理员：更新页面
export const onRequestPut: PagesFunction<Env> = async ({ request, params, env }) => {
  const token = getTokenFromCookie(request)
  if (!token) return error('未登录', 401)
  const user = await verifyToken(env, token)
  if (!user) return error('登录已过期', 401)

  const id = params.id as string
  const page = await env.NEKOWIKI_KV.get(`page:${id}`, 'json') as WikiPage | null
  if (!page) return error('页面不存在', 404)

  const { title, content } = await request.json() as { title?: string; content?: string }
  if (title !== undefined) page.title = title.trim()
  if (content !== undefined) page.content = content
  page.updatedAt = Date.now()

  await env.NEKOWIKI_KV.put(`page:${id}`, JSON.stringify(page))
  return json(page)
}

// 管理员：删除页面
export const onRequestDelete: PagesFunction<Env> = async ({ request, params, env }) => {
  const token = getTokenFromCookie(request)
  if (!token) return error('未登录', 401)
  const user = await verifyToken(env, token)
  if (!user) return error('登录已过期', 401)

  const id = params.id as string
  const page = await env.NEKOWIKI_KV.get(`page:${id}`, 'json')
  if (!page) return error('页面不存在', 404)

  await env.NEKOWIKI_KV.delete(`page:${id}`)

  const ids = await env.NEKOWIKI_KV.get('config:pages', 'json') as string[] | null
  if (ids) {
    await env.NEKOWIKI_KV.put('config:pages', JSON.stringify(ids.filter((i) => i !== id)))
  }

  return json({ ok: true })
}
