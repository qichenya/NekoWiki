import type { Env } from '../_shared'
import { json } from '../_shared'

export const onRequestPost: PagesFunction<Env> = async () => {
  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    'nekowiki_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
  )
  return json({ ok: true }, 200)
}
