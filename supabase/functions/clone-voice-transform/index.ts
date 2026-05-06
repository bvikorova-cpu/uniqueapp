// Transforms text into a chosen voice style via Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return j({ error: "No auth" }, 401);
    const { text, style } = await req.json();
    if (!text?.trim()) return j({ error: "text required" }, 400);

    const styleDesc: Record<string, string> = {
      warm: "warm, friendly, slightly casual, with a small touch of emotion or emoji",
      professional: "polished, precise, courteous, business-appropriate",
      energetic: "high-energy, enthusiastic, exclamation-heavy, motivational",
      calm: "calm, measured, soothing, contemplative",
      authoritative: "direct, confident, decisive, leadership-tone",
    };
    const desc = styleDesc[style] || styleDesc.warm;

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) return j({ error: "AI not configured" }, 500);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `Rewrite the user's text in a ${desc} voice. Keep meaning. Output only the rewritten text, no preamble.` },
          { role: "user", content: text },
        ],
      }),
    });
    if (res.status === 429) return j({ error: "Rate limit exceeded" }, 429);
    if (res.status === 402) return j({ error: "AI credits exhausted" }, 402);
    if (!res.ok) return j({ error: "AI error" }, 500);
    const data = await res.json();
    const transformed = data.choices?.[0]?.message?.content?.trim() || text;
    return j({ transformed });
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
