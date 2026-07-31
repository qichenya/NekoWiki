import type { Env } from '../_shared'

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'nekowiki_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
    },
  })
}
