import "../_shared/aiRedirect.ts";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const AI_KEY = Deno.env.get('LOVABLE_API_KEY') ?? 'vertex';

interface ModResult {
  allowed: boolean;
  nsfw: boolean;
  csam_suspected: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  categories: string[];
  reason?: string;
}

const SYSTEM_PROMPT =
  'You are a STRICT visual moderator for a general-audience platform where erotic, nude and sexual content is FORBIDDEN. ' +
  'Output ONLY compact JSON: {"allowed":bool,"nsfw":bool,"csam_suspected":bool,"severity":"none|low|medium|high","categories":[...],"reason":"..."}. ' +
  'Categories: nudity, partial_nudity, lingerie_underwear, sexual_explicit, sexual_suggestive, fetish, sex_toys, sexual_minors, violence_gore, hate_symbol, illegal. ' +
  'Set allowed=false and nsfw=true for ANY of: full or partial nudity, exposed or barely covered genitals/buttocks/female nipples, see-through clothing, lingerie or underwear as the subject, sexual acts or simulated sex, sexualized posing or close-ups of intimate body parts, fetish gear, sex toys, erotic/pornographic imagery of any kind. ' +
  'ZERO TOLERANCE for sexual_minors: csam_suspected=true, allowed=false, severity=high. ' +
  'Ordinary beachwear/sportswear in a non-sexual context, medical, and breastfeeding imagery are allowed. ' +
  'When uncertain between allowed and sexual content, choose allowed=false.';

async function moderateOne(url: string): Promise<ModResult> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Moderate this image.' },
            { type: 'image_url', image_url: { url } },
          ],
        },
      ],
      temperature: 0,
    }),
  });
  if (resp.status === 429) {
    return { allowed: true, nsfw: false, csam_suspected: false, severity: 'none', categories: [], reason: 'rate_limited' };
  }
  const data = await resp.json();
  const raw = data?.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim()) as ModResult;
  } catch {
    return { allowed: true, nsfw: false, csam_suspected: false, severity: 'none', categories: [], reason: 'parse_fail' };
  }
}

const isUsable = (u: unknown): u is string =>
  typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image/'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    // Accepts a single `image_url` or a batch of `image_urls` (e.g. video frames).
    const urls: string[] = Array.isArray(body?.image_urls)
      ? body.image_urls.filter(isUsable)
      : isUsable(body?.image_url) ? [body.image_url] : [];

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: 'image_url or image_urls required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.all(urls.slice(0, 6).map((u) => moderateOne(u)));
    const blocked = results.find((r) => r.allowed === false);
    const merged: ModResult = blocked ?? {
      allowed: true,
      nsfw: false,
      csam_suspected: false,
      severity: 'none',
      categories: [],
    };

    return new Response(JSON.stringify(merged), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
