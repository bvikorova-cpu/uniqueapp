import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TENOR_API_KEY = Deno.env.get("TENOR_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!TENOR_API_KEY) {
    return new Response(JSON.stringify({ error: "TENOR_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const limit = url.searchParams.get("limit") ?? "24";
    const endpoint = q
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=tinygif,gif&contentfilter=high`
      : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=${limit}&media_filter=tinygif,gif&contentfilter=high`;
    const r = await fetch(endpoint);
    const data = await r.json();
    const results = (data.results ?? []).map((g: any) => ({
      id: g.id,
      title: g.content_description ?? g.title ?? "",
      preview: g.media_formats?.tinygif?.url,
      url: g.media_formats?.gif?.url,
      width: g.media_formats?.gif?.dims?.[0],
      height: g.media_formats?.gif?.dims?.[1],
    }));
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
