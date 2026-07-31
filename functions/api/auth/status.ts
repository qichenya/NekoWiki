import type { Env, SiteConfig } from '../_shared'
import { json } from '../_shared'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const config = await env.NEKOWIKI_KV.get('config:site', 'json') as SiteConfig | null
  return json({ setupComplete: config?.setupComplete ?? false })
}
