// Pre-send AI moderation for dating chat messages.
// Returns { allow: boolean, reason?: string, severity?: 'low'|'medium'|'high' }
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // JWT validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.toLowerCase().startsWith("bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: au, error: authErr } = await supabase.auth.getUser();
    if (authErr || !au?.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const content = typeof body?.content === "string" ? body.content : "";
    if (!content) return json({ allow: true });

    const trimmed = content.trim().slice(0, 1500);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ allow: true });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    if (resp.status === 429 || resp.status === 402) return json({ allow: true });
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { parsed = {}; }

    const severity = parsed.severity ?? "none";
    const allow = severity !== "high";
    return json({ allow, severity, reason: parsed.reason, category: parsed.category });
  } catch (e) {
    return json({ allow: true, error: String(e) });
  }
});
