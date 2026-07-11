// Server-side probe. Fetches each named edge function's gateway URL from Deno
// and returns a status map. This keeps all per-function probe requests OFF the
// browser, so Lovable's runtime-error interceptor never sees non-2xx responses
// from probed functions and the error log stays clean.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const PROJECT_URL = Deno.env.get('SUPABASE_URL') ?? 'https://jufrdzeonywluwutvyxz.supabase.co'
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

interface ProbeResult {
  name: string
  code: number
  ms: number
  status: 'ok' | 'warn' | 'error'
}

function classify(code: number): ProbeResult['status'] {
  if (code === 401 || (code >= 200 && code < 400)) return 'ok'
  if (code === 404 || code === 403 || code === 429 || code === 405 || code === 400) return 'warn'
  if (code >= 500) return 'error'
  return 'warn'
}

async function probeOne(name: string): Promise<ProbeResult> {
  const t0 = performance.now()
  try {
    const res = await fetch(`${PROJECT_URL}/functions/v1/${name}?__probe=1`, {
      method: 'GET',
      headers: ANON_KEY ? { apikey: ANON_KEY } : {},
    })
    try { await res.text() } catch {}
    const code = res.status
    return { name, code, ms: Math.round(performance.now() - t0), status: classify(code) }
  } catch (_e) {
    return { name, code: 0, ms: Math.round(performance.now() - t0), status: 'error' }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const names: string[] = Array.isArray(body?.names) ? body.names.filter((n: unknown) => typeof n === 'string') : []
    if (names.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cap and run with bounded concurrency
    const capped = names.slice(0, 600)
    const CONCURRENCY = 16
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
