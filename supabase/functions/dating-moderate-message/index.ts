// Pre-send AI moderation for dating chat messages.
// Returns { allow: boolean, reason?: string, severity?: 'low'|'medium'|'high' }
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ allow: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const trimmed = content.trim().slice(0, 1500);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fail open if AI gateway not configured
      return new Response(JSON.stringify({ allow: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are a dating-app safety classifier. Reply ONLY valid JSON: {\"severity\":\"none|low|medium|high\",\"category\":\"none|harassment|sexual_minor|threat|hate|scam|self_harm\",\"reason\":\"short\"} . high = block (minors, threats, doxing, scams, slurs, explicit sexual harassment). medium = warn (mild insults, pressure). low/none = allow.",
          },
          { role: "user", content: trimmed },
        ],
        temperature: 0,
        max_tokens: 120,
      }),
    });

    if (resp.status === 429 || resp.status === 402) {
      return new Response(JSON.stringify({ allow: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { parsed = {}; }

    const severity = parsed.severity ?? "none";
    const allow = severity !== "high";
    return new Response(
      JSON.stringify({ allow, severity, reason: parsed.reason, category: parsed.category }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ allow: true, error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
