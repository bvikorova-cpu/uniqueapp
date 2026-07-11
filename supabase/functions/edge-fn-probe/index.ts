// Server-side probe. Calls each edge function with an authenticated POST
// carrying { __probe: true } and classifies the response.
//
// Classification: "does the function actually work?"
//   - 2xx                     → works (handler ran and returned OK)
//   - 400 / 401 / 403 / 405
//     / 409 / 422 / 429       → works (handler/gateway executed; the response
//                                is a normal reject, not a crash)
//   - 404                     → broken (function not deployed under this name)
//   - 5xx                     → broken (worker crashed / boot error)
//   - network / 0             → broken (unreachable)
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PROJECT_URL = Deno.env.get('SUPABASE_URL') ?? 'https://jufrdzeonywluwutvyxz.supabase.co'
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface ProbeResult {
  name: string
  code: number
  ms: number
  status: 'ok' | 'error'   // ok = funguje, error = nefunguje
  detail: string           // human readable reason
}

const ALIVE_CODES = new Set([200, 201, 202, 204, 400, 401, 403, 405, 409, 422, 429])

function classify(code: number): { status: 'ok' | 'error'; detail: string } {
  if (code >= 200 && code < 300) return { status: 'ok', detail: 'handler OK' }
  if (ALIVE_CODES.has(code)) {
    if (code === 401 || code === 403) return { status: 'ok', detail: `alive, gated (${code})` }
    if (code === 429) return { status: 'ok', detail: 'alive, rate-limited' }
    if (code === 405) return { status: 'ok', detail: 'alive, method guard' }
    return { status: 'ok', detail: `alive, validation rejected (${code})` }
  }
  if (code === 404) return { status: 'error', detail: 'NOT DEPLOYED (404)' }
  if (code >= 500) return { status: 'error', detail: `CRASH (${code})` }
  if (code === 0) return { status: 'error', detail: 'network unreachable' }
  return { status: 'error', detail: `unexpected ${code}` }
}

async function probeOne(name: string): Promise<ProbeResult> {
  const t0 = performance.now()
  try {
    const key = SERVICE_KEY || ANON_KEY
    const res = await fetch(`${PROJECT_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ __probe: true }),
      signal: AbortSignal.timeout(8000),
    })
    try { await res.text() } catch { /* ignore */ }
    const { status, detail } = classify(res.status)
    return { name, code: res.status, ms: Math.round(performance.now() - t0), status, detail }
  } catch (e) {
    const msg = (e as Error).message || 'network error'
    return { name, code: 0, ms: Math.round(performance.now() - t0), status: 'error', detail: `network: ${msg}` }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    if (body?.__probe) {
      return new Response(JSON.stringify({ probe: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const names: string[] = Array.isArray(body?.names)
      ? body.names.filter((n: unknown) => typeof n === 'string')
      : []
    if (names.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const capped = names.slice(0, 600)
    const CONCURRENCY = 12
    const results: ProbeResult[] = new Array(capped.length)
    let cursor = 0
    async function worker() {
      while (true) {
        const i = cursor++
        if (i >= capped.length) return
        results[i] = await probeOne(capped[i])
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
