import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 50);

    const apiKey = Deno.env.get('GIPHY_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GIPHY_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const endpoint = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg-13`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=pg-13`;

    const res = await fetch(endpoint);
    const json = await res.json();

    if (!res.ok || !Array.isArray(json?.data)) {
      return new Response(JSON.stringify({ error: json?.meta?.msg || 'Giphy error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gifs = json.data.map((g: any) => ({
      id: g.id,
      thumb: g.images?.fixed_height_small?.url || g.images?.original?.url,
      full: g.images?.original?.url,
    }));

    return new Response(JSON.stringify({ gifs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
